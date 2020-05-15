import numpy as np
import cv2
from matplotlib import pyplot as plt
print(cv2.__version__)
img = cv2.imread('C:\\Users\\Laptop Geert\\Documents\\GitHub\\2019-2020-PnOCW-team-1\\OpenCVTests\\simple.jpg',0)
# Initiate FAST object with default values
fast = cv2.FastFeatureDetector_create(threshold=25)
print(fast)
# find and draw the keypoints
kp = fast.detect(img,None)
print(kp)
img2 = cv2.drawKeypoints(img, kp,None, color=(255,0,0))

# Print all default params
print("Threshold: ", fast.getThreshold())
print("nonmaxSuppression: ", fast.getNonmaxSuppression())
print("neighborhood: ", fast.getType())
print("Total Keypoints with nonmaxSuppression: ", len(kp))

cv2.imwrite('OpenCVTests\\fast_true.png',img2)

# Disable nonmaxSuppression
fast.setNonmaxSuppression(0)
kp = fast.detect(img,None)

print ("Total Keypoints without nonmaxSuppression: ", len(kp))

img3 = cv2.drawKeypoints(img, kp, None, color=(255,0,0))

cv2.imwrite('OpenCVTests\\fast_false.png',img3)