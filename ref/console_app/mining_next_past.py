from __future__ import print_function
from datetime import date, datetime, timedelta
import mysql.connector
import cfscrape
from bs4 import BeautifulSoup
from dateutil import parser
import csv
import time
import sys

#hosturl = '127.0.0.1'
hosturl = 'ec2-52-200-152-246.compute-1.amazonaws.com'

cnx = mysql.connector.connect(user='root', password='fhzkfmsh12',
                              host=hosturl,
                              database='bustapick')                              
cursor = cnx.cursor()

scraper = cfscrape.create_scraper()

sleepGap = 10.1 


def find_last():
    sql = "select game from record order by game desc LIMIT 1 OFFSET 0"
    cursor.execute(sql)    
    for game in cursor:        
        return game[0]

def find_first():  
    sql = "select game from record order by game LIMIT 1 OFFSET 0"
    cursor.execute(sql)    
    for game in cursor:        
        return game[0]

def check(game): 
    sql = "select count(*) as count from record where game = %s"    
    cursor.execute(sql,(game,))
    for count in cursor:        
        if(count[0]!=1):                   
            return True
        else:
            print("Exist "+str(game))
            return False  

def insert_db(type):
    idx=0
    if type=='next':
        idx=find_last()+1        
    elif type=='past':
        idx=find_first()-1  
    if(check(idx)):
        try:                    
            url = "https://www.bustabit.com/game/" + str(idx)
            soup = BeautifulSoup(scraper.get(url).content, "lxml")      

            gamenum = soup.find('strong').text            
            rate = soup.find('p').contents[2]
            rate = rate.replace('x', '').strip()                     
            rate = rate.replace(',','').strip()
            date = str(parser.parse(soup.find_all('p')[1].contents[2], ignoretz=True))

            param = (gamenum, rate, date)
            sql="INSERT INTO record VALUES (%s, %s, %s)"        
            cursor.execute(sql, param)
            cnx.commit()                         
            print("Insert: "+gamenum+" / "+rate+" / "+date)
            time.sleep(sleepGap)
        except KeyboardInterrupt:
            print("Exit..")
            sys.exit()
        except BaseException as e:
            print(str(e))                    
            insert_db('past')
    

def main():
    print("Initiate session Start")
    scraper.get("https://www.bustabit.com/game/1")
    print("Initiate session Success")

    while(True):       
        insert_db('next')                             

    cursor.close()
    cnx.close()


if __name__ == "__main__":   
   main()   