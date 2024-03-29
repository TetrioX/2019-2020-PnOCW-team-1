## Team meeting 1 - 11/02/2020
- Opgave werd door iedereen gelezen
- Jobs werden herverdeeld
- Team werd opgesplitst in 2: 
  - Xander, Simon C en Maxel doen de synchronizatie
  - Simon T, Dennis en Geert werken aan de kleurenherkenning
- Per taak werd er een planning opgesteld

## Team meeting 2 - 18/02/2020
- Er werd besproken wat er in het 'plan of attack' moet geschreven worden en wie wat zal schrijven. Later in deze sessie zal dit ook geschreven worden.
- Het team kleurenherkenning heeft het volgende voor deze sessie gepland:
  - Enkele kleuren selecteren en foto's nemen van schermen met verschillen in: helderheid, afstand tot scherm, 2 kleuren naast elkaar, resolutie...
  - Uit deze foto's enkele grafieken maken met Excel en hieruit conclusies proberen trekken, zoals welke methode het beste werkt in onze toepassing (RGB, HSL, HSV)
- Het team synchronisatie plande het volgende:
  - Uizoeken aan de hand van wat we verschillende apparaten gaan vergelijken.
  - De vergelijkingen uitvoeren:
    - Verschillende PC's vergelijken (Windows, Mac, Linux)
    - Op eenzelfde PC vergelijken (Browser, verschillende workload...)

## Team meeting 3 - 25/02/2020
- Team synchronisatie heeft de meeste testen al gedaan. Deze testen omvatten verschillen 
 in workload, computers en browsers. Het verslag 
(met vandaag de deadline) is voor ongeveer de helft klaar.
- Team kleuren deed al enkele testen met foto's van een rood scherm,
 telkens met lichtjes andere belichting. Er werd een programma geschreven waarbij 
 bij elke foto 5 punten geselecteerd moesten worden en waarbij de kleurwaarden 
 (alsook saturatie, hue...) in een Excel-bestand werden gegoten. Uit dit bestand konden
  dan enkele 3D-grafieken verkregen worden.
  
## Team meeting 4 - 03/03/2020
- Team kleuren gebruikte het programma dat vorige sessie geschreven werd om nog
 meer foto's te testen. Alle foto's uit de gemeenschappelijke database werden gebruikt. 
 Hieruit werden nog meer 3D-grafieken gegenereert die bestudeert en vergeleken werden. 
 Ook het verslag van ST2.1 is afgewerkt.
- Voor het deel synchronisatie werden de resterende testen met de browsers gedaan. 
Ook werd er een lineair verband gevonden tussen de delay en offset van de klok. 
Het verslag van ST1.1 werd afgewerkt.

## Team meeting 5 - 10/03/2020
- Bij het deel synchronisatie werd er een eerste animatie gemaakt
 en deze werd gebruikt om de accuraatheid ervan te testen op verschillende browsers.
- Team kleurenherkenning heeft verschillende filters geïmplementeerd en deze getest. 
Er werd ook een algoritme geschreven om iteratief drempelwaarden te berekenen.

## Team meeting 6 - 17/03/2020 (online)
- Eerste online meeting
- Vorige taken (ST1.2 en ST2.2) zijn afgerond.
- Planning voor komende weken werd opgesteld (zie schedule).

## Team meeting 7 - 24/03/2020 (online)
- Video synchronisatie werd aangepast (is nu dezelfde als in vorige task).
- Iteratief schermen herkennen geïmplementeerd (wanneer er een scherm herkent word
 en deze heeft een bepaalde schijn, worden de drempelwaarden voor de volgende schermen
  die het algoritme probeert te herkennen verschoven zodat deze schermen
   beter herkent kunnen worden.).
- Filters toegepast en het effect hiervan bestudeerd.

## Team meeting 8 - 31/03/2020 (online)
- Enkele bugfixes werden uitgevoerd (Er konden bijvoorbeeld voordien 
twee masters zijn, nu is dit niet meer)
- Er werd getest met de gyroscoop van een master device. 
De verschillende hoekafwijkingen kunnen nu verkregen worden.
- In verband met keypoint-tracking werd er getest met tracking.js. 
Verder werd er nog besproken hoe we de verplaatsing van een scherm eenduidig kunnen bepalen.

## Team meeting 9 - 21/04/2020 (online)
- Demo

## Team meeting 10 - 28/04/2020 (online)
- Hoeken van master device (uit gyroscoop) 
kunnen verkregen worden en transformatiematrix kan opgesteld worden. Real time
transformeren van images en dergelijke nog niet getest.
- Sticker tracking (Geert): Hoeken kunnen meestal herkend worden. Nog kleine 
bugs en werking in het geheel moet nog getest worden.
- Keypoint tracking is geïmplementeerd en getest. Kwaliteit van transformatie 
is ok (camera moet wel rustig bewogen worden). Implementatie is echter te traag: 
uitrekenen van transformatie is snel maar het sturen van foto's naar server 
zorgt voor sterke vertraging.

## Team meeting 11 - 05/05/2020 (online)
- Eerste versie van 3D scene is geïmplementeerd en werkt.
- Keypoint tracking is sneller gemaakt
- Deel met gyroscoop werkt vlot (met de nodige assumpties)