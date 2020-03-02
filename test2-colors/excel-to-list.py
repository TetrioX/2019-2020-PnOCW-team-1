# Dependency: openpyxl

from openpyxl import load_workbook, cell as xlcell

# excel file name
fileName = "resultAll.xlsx"

# filters (None means doesnt filter)
group = None # group
brigthness = None # brigthness
pictureDevice = None # pictureDevice
ratioScreenPicture = None # ratioScreenPicture
distance = None # distance
nbOfColros = None # nbOfColros
incidence = None # incidence
reflection = None # reflection
screenDevice = None # screenDevice
imageID = None # imageID
origHexCol = lambda x: x == "#ff0000" or x == "#ff5500"\
                or x == "#ffaa00" or x == "#ffff00"\
                or x == "#aaff00" or x == "#55ff00"\
                or x == "#00ff00" or x == "#00ff55"\
                or x == "#00ffaa" or x == "#00ffff"\
                or x == "#00aaff" or x == "#0055ff"\
                or x == "#0000ff" or x == "#5500ff"\
                or x == "#aa00ff" or x == "#ff00ff"\
                or x == "#ff00aa" or x == "#ff0055" # origHexCol

global ws
result = []
keys = []
print("==> reading resultAll.xlsx (this can take several minutes)...", flush=True)
wb = load_workbook(filename = './'+"resultAll.xlsx", read_only=True, data_only=True)
ws = wb.active
def checkFilters(values, filters, row):
    global ws
    cols = "ABCDEFGHIJKL"
    for i in range(len(filters)):
        val = row[filters[i][0]].value
        if val is not None:
            values[i] = val
        if callable(filters[i][1]):
            return filters[i][1](values[i])     
        else:
            if values[i] != filters[i][1] and filters[i][1] is not None:
                return False
    return True


# setting up filters variables
print("==> setting up filters", flush=True)
image = 2
allFilters = [group, brigthness, pictureDevice, ratioScreenPicture, distance, \
nbOfColros, incidence, reflection, screenDevice, imageID, origHexCol]
filters = []
for i in range(len(allFilters)):
    if allFilters[i] is not None or i == 10:
        filters.append((i, allFilters[i]))
curValues = [None]*len(filters)

print("==> filtering values", flush=True)
for row in ws.iter_rows(min_row=2, max_col=12):
    if checkFilters(curValues, filters, row):
        result.append(row[11].value)
        keys.append(curValues[-1])
print("result: ", result)
print("keys: ", keys)
