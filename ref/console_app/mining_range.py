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
hosturl = 'ec2-34-203-159-36.compute-1.amazonaws.com'

cnx = mysql.connector.connect(user='root', password='fhzkfmsh12',
                              host=hosturl,
                              database='bustapick')                              
cursor = cnx.cursor()

scraper = cfscrape.create_scraper()
start = 0
end = 0
current = 0
sleepGap = 10.1 

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


def check(game): 
    sql = "select count(*) as count from record where game = %s"    
    cursor.execute(sql,(game,))
    for count in cursor:        
        if(count[0]!=1):                   
            return True
        else:
            print("Exist "+str(game))
            return False  


def insert_db():
    global itr, current    
    if(check(current)):
        try:                    
            url = "https://www.bustabit.com/game/" + str(current)
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
        except BaseException as e:
            print(str(e))                    
            sys.exit()
    current+=1

def main(argv):
    global start,end,current
    start, end = int(argv[0]), int(argv[1])
    current = int(start)

    print("Initiate session Start")
    scraper.get("https://www.bustabit.com/game/1")
    print("Initiate session Success")

    while(current <= end):       
            try:
                insert_db()                             
            except KeyboardInterrupt:
                cursor.close()
                cnx.close()            
                sys.exit()
            except:                                                  
                cursor.close()
                cnx.close()            
                sys.exit()
    cursor.close()
    cnx.close()

# Need 2 argument seperated by space for start, and end number
if __name__ == "__main__":   
   main(sys.argv[1:])