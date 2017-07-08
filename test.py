from __future__ import print_function
from datetime import date, datetime, timedelta
import mysql.connector
import cfscrape
from bs4 import BeautifulSoup
import csv
import time
import sys

def find_last():
    sql = "select * from record order by game desc LIMIT 1 OFFSET 0"
    cursor.execute(sql)    
    for game, rate in cursor:
        return game

def find_first():  
    sql = "select * from record order by game LIMIT 1 OFFSET 0"
    cursor.execute(sql)    
    for game, rate in cursor:
        return game

def insert_db(type):
    idx=0
    if type=='next':
        idx=find_last
    elif type=='past':
        idx=find_first()
    url = "https://www.bustabit.com/game/" + str(idx)
    try:
        soup = BeautifulSoup(scraper.get(url).content, "lxml")
        gamenum = soup.find('strong').text            
        rate = soup.find('p').contents[2]
        rate = rate.replace('x', '').strip()                     
        sql="insert into record values(%s, %s)"
        param = (gamenum, rate)
        cursor.execute(sql, param)
        cnx.commit()
        print(str(itr) + "th connection: "+gamenum+" / "+rate+" / "+type)                    
        time.sleep(5)
        target += 1
        itr+=1        
    except:
        insert_db('past')     
        
cnx = mysql.connector.connect(user='root', password='fhzkfmsh12',
                              host='127.0.0.1',
                              database='bustapick')
cursor = cnx.cursor()

scraper = cfscrape.create_scraper()

print("Initiate session")
scraper.get("https://www.bustabit.com/game/1")

itr=0
while(True):       
        try:
            insert_db('next')                   
        except KeyboardInterrupt:            
            break    
        except:
            print("Unexpected error: ")
            print(sys.exc_info()[0])
            time.sleep(5)        
            continue
        

cursor.close()
cnx.close()