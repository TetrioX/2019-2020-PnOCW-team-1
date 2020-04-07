import numpy as np
import cv2
from matplotlib import pyplot as plt
print(cv2.__version__)
img1 = cv2.imread('C:\\Users\\Laptop Geert\\Documents\\GitHub\\2019-2020-PnOCW-team-1\\OpenCVTests\\test_img_1.jpg',0)
img2 = cv2.imread('C:\\Users\\Laptop Geert\\Documents\\GitHub\\2019-2020-PnOCW-team-1\\OpenCVTests\\test_img_2.jpg',0)
# Initiate STAR detector
orb = cv2.ORB_create()
# find the keypoints and descriptors with SIFT
kp1, des1 = orb.detectAndCompute(img1,None)
kp2, des2 = orb.detectAndCompute(img2,None)

# create BFMatcher object
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

# Match descriptors.
matches = bf.match(des1,des2)

# Sort them in the order of their distance.
matches = sorted(matches, key = lambda x:x.distance)

# Draw first 10 matches.
img3 = cv2.drawMatches(img1,kp1,img2,kp2,matches[:10],None, flags=0)
#img3 = cv2.drawKeypoints(img1,kp1,img3,color=(0,255,0), flags=1)
#img3 = cv2.drawKeypoints(img2,kp2,img3,color=(0,0,255), flags=1)		

cv2.imwrite('OpenCVTests\\orb.png',img3)
plt.imshow(img3),plt.show()


# draw only keypoints location,not size and orientation
#img2 = cv2.drawKeypoints(img,kp,None,color=(0,255,0), flags=0)
#cv2.imwrite('OpenCVTests\\orb.png',img2)
#plt.imshow(img2),plt.show()