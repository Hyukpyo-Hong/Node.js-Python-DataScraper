from __future__ import print_function

import mysql.connector

import csv
import time
import sys


fromhosturl = 'ec2-54-144-200-138.compute-1.amazonaws.com'
fromcnx = mysql.connector.connect(user='root', password='fhzkfmsh12',
                              host=fromhosturl,
                              database='bustapick')                              
fromcursor = fromcnx.cursor()

tohosturl = 'ec2-52-200-152-246.compute-1.amazonaws.com'
tocnx = mysql.connector.connect(user='root', password='fhzkfmsh12',
                              host=tohosturl,
                              database='bustapick')                              
tocursor = tocnx.cursor()

def migrate(): 
    sql = "select * from record order by game"    
    fromcursor.execute(sql)
    for game,rate,date in fromcursor:        
        insert_db(game,rate,date)

def check(game):
    sql = "select count(*) as count from record where game = %s"    
    tocursor.execute(sql,(game,))
    for count in tocursor:        
        if(count[0]!=1):                   
            return True
        else:
            print("SKIP "+str(game))
            return False  

def insert_db(game,rate,date):
        try:       
            if(check(str(game))):
                sql="INSERT INTO record VALUES (%s, %s, %s)"        
                param = (str(game), str(rate), str(date))
                tocursor.execute(sql, param)
                tocnx.commit()                        
                print("Inserted "+str(game)+ str(rate)+ str(date))
        except BaseException as e:
            print(str(e))                    
            sys.exit()


def main():
    print("Start")
    migrate()
    print("Done")
    fromcursor.close()
    fromcnx.close()
    tocursor.close()
    tocnx.close()

if __name__ == "__main__":   
   main()