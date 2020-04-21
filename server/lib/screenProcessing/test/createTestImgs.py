import os
import cv2
from PIL import ImageEnhance



filters = ['gauss', 'median', 'mean', 'scaled_0.75', 'scaled_0.50','scaled_0.25', 'scaled_0.10', 'sharpen']

def create_filtered_img(case, filter):
    if filter not in filters:
        return
    i = 0
    path = './rgbTestCases/' + case
    img0 = cv2.imread(path + '/image-0.png')
    img1 = cv2.imread(path + '/image-1.png')
    img2 = cv2.imread(path + '/image-2.png')
    imgs = [img0, img1, img2]
    dirName = path + '/' + str(filter)
    if not os.path.exists(dirName):
        os.mkdir(dirName)
    while i < len(imgs):
        path_out = dirName + '/image-'+ str(i) + '.png'
        if filter == 'gauss':
            temp = gaussian_blur(imgs[i])
            cv2.imwrite(path_out, temp)
        elif filter == 'median':
            temp = median_blur(imgs[i])
            cv2.imwrite(path_out, temp)
        elif filter == 'scaled_0.75':
            temp = rescale_image(imgs[i], 0.75)
            cv2.imwrite(path_out, temp)
        elif filter == 'scaled_0.50':
            temp = rescale_image(imgs[i], 0.50)
            cv2.imwrite(path_out, temp)
        elif filter == 'scaled_0.25':
            temp = rescale_image(imgs[i], 0.25)
            cv2.imwrite(path_out, temp)
        elif filter == 'scaled_0.10':
            temp = rescale_image(imgs[i], 0.10)
            cv2.imwrite(path_out, temp)
        elif filter == 'sharpen':
            temp = sharpen_image(imgs[i], 2)
            cv2.imwrite(path_out, temp)
        elif filter == 'mean':
            temp = mean_blur(imgs[i])
            cv2.imwrite(path_out, temp)
        i += 1

def gaussian_blur(img):
    gb = cv2.GaussianBlur(img, (3,3), 0)
    return gb

def median_blur(img):
    mb = cv2.medianBlur(img, 5)
    return mb

def mean_blur(img):
    mb = cv2.blur(img, (5,5))
    return mb

def rescale_image(img, amount):
    sc = cv2.resize(img, None,fx=amount, fy=amount)
    return sc
def sharpen_image(img, amount):
    si = ImageEnhance.Sharpness(img).enhance(amount)
    return si
for f in filters:
    create_filtered_img('case16', f)