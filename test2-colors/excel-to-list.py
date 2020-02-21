# Dependency: openpyxl

from openpyxl import load_workbook, cell as xlcell


# filters (None means doesnt filter)
group = "01" # group
brigthness = None # brigthness
pictureDevice = None # pictureDevice
ratioScreenPicture = None # ratioScreenPicture
distance = None # distance
nbOfColros = None # nbOfColros
incidence = None # incidence
reflection = None # reflection
screenDevice = None # screenDevice
imageID = None # imageID
origHexCol = "#00ff00" # origHexCol
picHexCol = None # picHexCol

global ws
result = []
wb = load_workbook(filename = './result.xlsx')
ws = wb.active

image = 2

def checkFilter(col, row, filter):
    global ws
    if filter is None or get_value_merged(ws, ws[col+str(image)]) == filter:
        return True
    else:
        return False

# source: https://stackoverflow.com/questions/23562366/how-to-get-value-present-in-a-merged-cell
def within_range(bounds: tuple, cell: xlcell) -> bool:
    column_start, row_start, column_end, row_end = bounds
    row = cell.row
    if row >= row_start and row <= row_end:
        column = cell.column
        if column >= column_start and column <= column_end:
            return True
    return False

def get_value_merged(sheet, cell) -> any:
    for merged in sheet.merged_cells:
        if within_range(merged.bounds, cell):
            return sheet.cell(merged.min_row, merged.min_col).value
    return cell.value

while ws["L"+str(image)].value is not None:
    if checkFilter("A", image, group) \
    and checkFilter("B", image, brigthness) \
    and checkFilter("C", image, pictureDevice) \
    and checkFilter("D", image, ratioScreenPicture) \
    and checkFilter("E", image, distance) \
    and checkFilter("F", image, nbOfColros) \
    and checkFilter("G", image, incidence) \
    and checkFilter("H", image, reflection) \
    and checkFilter("I", image, screenDevice) \
    and checkFilter("J", image, imageID) \
    and checkFilter("K", image, origHexCol) \
    and checkFilter("L", image, picHexCol):
        result.append(ws["L"+str(image)].value)
    image += 1
print(result)
