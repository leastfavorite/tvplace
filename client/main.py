import asyncio
import os
import aiohttp
import io
import hashlib
import time
import urllib3

from PIL import Image

from signal import SIGINT, SIGTERM
from samsungtvws.async_art import SamsungTVAsyncArt
from typing import Any, cast

urllib3.disable_warnings()

ERROR_TIMEOUT = 300
UPLOAD_TIMEOUT = 5
SAME_HASH_TIMEOUT = 60
CHECK_CLOSE_TIMEOUT = 15

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

def inArtMode(tv: SamsungTVAsyncArt) -> asyncio.Future[None]:
    future: asyncio.Future[None] = asyncio.Future()
    if tv.art_mode:
        future.set_result(None)
        return future

    if not tv.is_alive():
        future.set_exception(Exception("tv is down"))
        return future

    print("waiting for art mode")
    def on_art_mode_changed(*_: Any) -> None:
        if tv.art_mode:
            print("in art mode")
            future.set_result(None)
            tv.set_callback('art_mode_changed') # remove callback
    tv.set_callback('art_mode_changed', on_art_mode_changed)

    async def cancel_if_tv_off() -> None:
        while not future.done():
            await asyncio.sleep(CHECK_CLOSE_TIMEOUT)
            if not tv.is_alive():
                future.set_exception(Exception("tv is down"))
    asyncio.ensure_future(cancel_if_tv_off())

    return future

async def main() -> None:
    asyncio.get_running_loop().add_signal_handler(SIGINT, lambda: os._exit(1))
    asyncio.get_running_loop().add_signal_handler(SIGTERM, lambda: os._exit(1))

    async with SamsungTVAsyncArt(host=os.environ["TV_IP"], port=8002, token_file="./token.txt") as tv_:
        tv = cast(SamsungTVAsyncArt, tv_)

        if not await tv.on():
            raise Exception("tv is down")
        else:
            print('start monitoring')
            try:
                await tv.start_listening()
                print('connected')
            except Exception as e:
                print('failed to connect with TV: {}'.format(e))
        if not tv.is_alive():
            raise Exception("tv is down")

        oldhash = b''
        while True:
            if not tv.is_alive():
                raise Exception("tv is down")
            if not await tv.is_artmode():
                await inArtMode(tv)
            image, imhash = await getImage(oldhash)
            oldhash = imhash

            if await tv.is_artmode():
                print("uploading")
                old_id = await tv.get_current()
                img_id = await tv.upload(image, file_type="png", matte="none", portrait_matte="none")
                await tv.select_image(img_id)
                await tv.delete(old_id["content_id"])
            await asyncio.sleep(UPLOAD_TIMEOUT)

if __name__ == "__main__":
    while True:
        try:
            asyncio.run(main())
        except (KeyboardInterrupt, SystemExit):
            os._exit(1)
        except Exception as e:
            print(e)
            time.sleep(ERROR_TIMEOUT)
            continue
