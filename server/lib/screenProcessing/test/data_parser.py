import pandas as pd
from openpyxl import Workbook, load_workbook
import json
import time


cs = 'caseNB'
scr = 'screensFound'
sq = 'squaresFound'
n = 6
total_screens = 104
total_squares = 846
jpath = './results/results.json'
expath = './results/results.xlsx'

def get_amount_of_sheets(wb):
    count = 0
    for sheet in wb:
        count += 1
    return count

def initExcel(nb, excel_path):
    wb = Workbook()
    for i in range(nb):
        sh_name = 'Tresholds' + str(i)
        wb.create_sheet(sh_name)
        ws = wb[sh_name]
        ws['A1'] = 'Case Number'
        ws['B1'] = 'Screens found'
        ws['C1'] = 'Squares found'
        ws['F1'] = 'Totaal schermen'
        ws['H1'] = 'Totaal vierkanten'
        ws['K1'] = 'Percentage schermen'
        ws['N1'] = 'Percentage vierkanten'


    wb.save(excel_path)


def writeExcel(nb, excel_path, json_path):
    with open(json_path, encoding="utf8") as f:
        json_data = json.load(f)
    wb = load_workbook(excel_path)
    for i in range(nb):
        j = 1
        sh_name = 'Tresholds' + str(i)
        ws = wb[sh_name]
        val = json_data[str(i)]
        mx = ws.max_row
        for elem in val:
            ws['A' + str(mx+j)] = elem[cs]
            ws['B' + str(mx + j)] = elem[scr]
            ws['C' + str(mx + j)] = elem[sq]
            j += 1
        mx2 = ws.max_row
        ws['F2'] = '=SOM(B2:B' + str(mx2) + ')'
        ws['H2'] = '=SOM(C2:C' + str(mx2) + ')'
        ws['K2'] = '=100*F2/' + str(total_screens)
        ws['N2'] = '=100*H2/' + str(total_squares)

    wb.save(excel_path)



def main():
    initExcel(n,expath)
    writeExcel(n,expath,jpath)


main()