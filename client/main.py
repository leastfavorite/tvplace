import asyncio
import os
import aiohttp
import io
import hashlib

from PIL import Image

from signal import SIGINT, SIGTERM
from samsungtvws.async_art import SamsungTVAsyncArt

ERROR_TIMEOUT = 300
UPLOAD_TIMEOUT = 60
SAME_HASH_TIMEOUT = 60

async def getImage(last_hash: bytes) -> tuple[bytes, bytes]:
    print("getting image")
    while True:
        async with aiohttp.ClientSession() as session:
            async with session.get('https://place.aria.city/board') as response:
                if response.status != 200:
                    print("server is down")
                    await asyncio.sleep(ERROR_TIMEOUT)
                    continue
                img_bytes = await response.read()

        img_hash = hashlib.md5(img_bytes).digest()
        if img_hash == last_hash:
            print("hashes match")
            await asyncio.sleep(SAME_HASH_TIMEOUT)
            continue

        try:
            img_raw = Image.open(io.BytesIO(img_bytes))
        except Exception:
            print("server sent malformed response")
            await asyncio.sleep(ERROR_TIMEOUT)
            continue

        last_hash = img_hash
        img = img_raw.resize([3840, 2160], Image.Resampling.NEAREST)
        stream = io.BytesIO()
        img.save(stream, format="PNG")
        print("got image")
        return (stream.getvalue(), img_hash)

def entersArtMode(tv: SamsungTVAsyncArt) -> asyncio.Future[None]:
    print("waiting for art mode")
    future: asyncio.Future[None] = asyncio.Future()
    def _callback(_: str, resp: dict[str, dict[str, str]]) -> None:
        if resp["data"]["status"] == "on":
            future.set_result(None)
            tv.set_callback('art_mode_changed') # remove callback
    tv.set_callback('art_mode_changed', _callback)
    print("got art mode")
    return future

async def main() -> None:
    asyncio.get_running_loop().add_signal_handler(SIGINT, lambda: os._exit(1))
    asyncio.get_running_loop().add_signal_handler(SIGTERM, lambda: os._exit(1))

    tv = SamsungTVAsyncArt(host=os.environ["TV_IP"], port=8002, token_file="./token.txt")
    try:
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
            return

        oldhash = b''
        while True:
            if not await tv.is_artmode():
                await entersArtMode(tv)
            image, imhash = await getImage(oldhash)
            oldhash = imhash

            if await tv.is_artmode():
                print("uploading")
                old_id = await tv.get_current()
                img_id = await tv.upload(image, file_type="png", matte="none", portrait_matte="none")
                await tv.select_image(img_id)
                await tv.delete(old_id["content_id"])
        await asyncio.sleep(UPLOAD_TIMEOUT)
    finally:
        await tv.close()



if __name__ == "__main__":
    while True:
        try:
            asyncio.run(main())
        except (KeyboardInterrupt, SystemExit):
            os._exit(1)
        except Exception:
            time.sleep(ERROR_TIMEOUT)
            continue
