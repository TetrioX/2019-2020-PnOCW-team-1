import cv2
import numpy as np
from skimage.util import random_noise
# https://theailearner.com/2019/05/07/add-different-noise-to-an-image/


# FILTERS
def gauss(image_path_in, image_path_out, kernel_size=5, sigma=0):
    img = cv2.imread(image_path_in)
    g = cv2.GaussianBlur(img, (kernel_size, kernel_size), sigma)
    cv2.imwrite(image_path_out, g)

def median(image_path_in, image_path_out, kernel_size=5):
    img = cv2.imread(image_path_in)
    m = cv2.medianBlur(img, kernel_size)
    cv2.imwrite(image_path_out, m)

def mean(image_path_in, image_path_out, kernel_size=5):
    img = cv2.imread(image_path_in)
    a = cv2.blur(img, (kernel_size,kernel_size))
    cv2.imwrite(image_path_out, a)

def bilateral(image_path_in, image_path_out, kernel=0):
    img = cv2.imread(image_path_in)
    b = cv2.bilateralFilter(img, 9, 75, 75)
    cv2.imwrite(image_path_out, b)

# ADDING NOISE
def salt_and_pepper(image_path_in, image_path_out, amount=0.001):
    #https://theailearner.com/2019/05/07/add-different-noise-to-an-image/
    img = cv2.imread(image_path_in)
    sp = random_noise(img, mode='s&p', amount=amount)
    sp = np.array(255*sp, dtype = 'uint8')
    cv2.imwrite(image_path_out, sp)

def gauss_noise(image_path_in, image_path_out, mean=0, var=0.01):
    img = cv2.imread(image_path_in)
    g = random_noise(img, mode='gaussian', mean=mean, var=var)
    g = np.array(255 * g, dtype='uint8')
    cv2.imwrite(image_path_out, g)

def speckle(image_path_in, image_path_out, mean=0, var=0.01):
    img = cv2.imread(image_path_in)
    s = random_noise(img, mode='speckle', mean=mean, var=var)
    s = np.array(255 * s, dtype='uint8')
    cv2.imwrite(image_path_out, s)

def poisson(image_path_in, image_path_out):
    img = cv2.imread(image_path_in)
    p = random_noise(img, mode='poisson')
    p = np.array(255 * p, dtype='uint8')
    cv2.imwrite(image_path_out, p)



# TEST
img_p_i = './image-0.png'
img_p_o = './image-p-0.png'

poisson(img_p_i, img_p_o)




