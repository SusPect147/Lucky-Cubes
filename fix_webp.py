from PIL import Image
import os
import glob

files = [
    r'c:\Users\User\Desktop\LUCU\Lucky-Cubes\assets\UI\images\cases\1-case.webp',
    r'c:\Users\User\Desktop\LUCU\Lucky-Cubes\assets\UI\images\cases\2-case.webp',
    r'c:\Users\User\Desktop\LUCU\Lucky-Cubes\assets\UI\images\cases\3-case.webp',
    r'c:\Users\User\Desktop\LUCU\Lucky-Cubes\assets\UI\images\badge-n.webp',
]

for file in files:
    if os.path.exists(file):
        try:
            img = Image.open(file).convert("RGBA")
            data = img.getdata()
            new_data = []
            for item in data:
                if item[0] > 240 and item[1] > 240 and item[2] > 240:
                    new_data.append((255, 255, 255, 0))
                else:
                    new_data.append(item)
            img.putdata(new_data)
            img.save(file, "WEBP")
            print(f"Processed {file}")
        except Exception as e:
            print(f"Error {file}: {e}")
