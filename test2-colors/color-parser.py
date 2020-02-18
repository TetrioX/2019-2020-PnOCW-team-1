# Dependency: openpyxl
from os import walk
from openpyxl import Workbook

wb = Workbook()
ws = wb.active

# header
ws["A1"] = "group"
ws["B1"] = "brigthness"
ws["C1"] = "pictureDevice"
ws["D1"] = "ratioScreenPicture"
ws["E1"] = "distance"
ws["F1"] = "nbOfColros"
ws["G1"] = "incidence"
ws["H1"] = "reflection"
ws["I1"] = "screenDevice"
ws["J1"] = "imageID"
ws["K1"] = "hexCol"
ws["L1"] = "R"
ws["M1"] = "G"
ws["N1"] = "B"

image = 2 # current row

function writeBlock(col, row, val, nb):
    if (nb != 1):
        ws.merge_cells(col+str(row)+col+str(int(row)+int(nb-1))
    ws[col+str(row)] = val


for group in os.walk("./"):
    for (dirpath, dirnames, filenames) in walk(mypath):
        nb = int(pictureName[4])
        writeBlock("A", image, group[2], nb)
        writeBlock("B", image, pictureName[0], nb)
        writeBlock("C", image, pictureName[1], nb)
        writeBlock("D", image, pictureName[2], nb)
        writeBlock("E", image, pictureName[3], nb)
        writeBlock("F", image, pictureName[4], nb)
        writeBlock("G", image, pictureName[int(pictureName[4])*3 + 5], nb)
        writeBlock("H", image, pictureName[int(pictureName[4])*3 + 6], nb)
        writeBlock("I", image, pictureName[int(pictureName[4])*3 + 7], nb)
        writeBlock("J", image, pictureName[int(pictureName[4])*3 + 8], nb)
        for i in range(int(pictureName[4])):
            ws["L"+str(image + i - 1)] = 0

wb.save('result.xlsx')
