import asyncio
import os
import aiohttp
import io

from PIL import Image

from signal import SIGINT, SIGTERM
from samsungtvws.async_art import SamsungTVAsyncArt

async def main() -> None:
    asyncio.get_running_loop().add_signal_handler(SIGINT, lambda: os._exit(1))
    asyncio.get_running_loop().add_signal_handler(SIGTERM, lambda: os._exit(1))

    async with aiohttp.ClientSession() as session:
        async with session.get('https://place.aria.city/board') as response:
            img_bytes = await response.read()

    img = Image.open(io.BytesIO(img_bytes)).resize([3840, 2160], Image.Resampling.NEAREST)
    stream = io.BytesIO()
    img.save(stream, format="PNG")
    img_bytes = stream.getvalue()

    tv = SamsungTVAsyncArt(host=os.environ["TV_IP"], port=8002, token_file="./token.txt")
    if not await tv.on():
        print('TV is off, exiting')
        return
    else:
        print('Start Monitoring')
        try:
            await tv.start_listening()
            print('Started')
        except Exception as e:
            print('failed to connect with TV: {}'.format(e))
    if not tv.is_alive():
        await tv.close()
        return

    img_id = await tv.upload(img_bytes, file_type="png", matte="none", portrait_matte="none")
    await tv.select_image(img_id)
    await tv.close()



if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        os._exit(1)
