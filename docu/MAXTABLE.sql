USE BUSTAPICK;
DELIMITER $$

DROP PROCEDURE IF EXISTS `maxt` $$
CREATE PROCEDURE maxt ()
BEGIN
  
  DECLARE compare float(10,2);  
  DECLARE streak int;  
  DECLARE _rate int;
  DECLARE _game int;
  DECLARE count int;
  SET @compare = 1;
  SET @streak = 0;  
   
  delete from maxtable;
  
   while(@compare <= 5) do
	 select @compare, max(sub.result) 
     INTO  @_game, @_count
     from (
	select rate, IF(rate<@compare, (@streak := @streak + 1), @streak := 0) as result from record order by game ) as sub;    
    
    if(@compare>=10) 
    THEN set @compare = @compare + 1;
    ELSE set @compare = @compare + 0.01;
    END IF;

	insert into maxtable values(@_game,@_count);
 end while;

END $$

DELIMITER ;


call maxt();
