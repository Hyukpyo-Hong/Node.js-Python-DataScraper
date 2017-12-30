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

itr =0
def insert_db(type):
    global itr
    if type=='next':
        idx=find_last()+1        
    elif type=='past':
        idx=find_first()-1        
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
        itr+=1

    except KeyboardInterrupt:
        sys.exit()
    except:
        print("Wait..")                
        time.sleep(3)
        insert_db('past')     
        
cnx = mysql.connector.connect(user='root', password='root',
                              host='127.0.0.1',
                              database='bustapick')
cursor = cnx.cursor()
scraper = cfscrape.create_scraper()

print("Initiate session")
scraper.get("https://www.bustabit.com/game/1")


while(True):       
        try:
            insert_db('past')      
            time.sleep(3)             
        except KeyboardInterrupt:            
            sys.exit()
        except:            
            print(sys.exc_info()[0])
            time.sleep(3)        
            continue        

cursor.close()
cnx.close()