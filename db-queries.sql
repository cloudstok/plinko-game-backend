CREATE DATABASE plinko_game;
USE plinko_game;

CREATE TABLE IF NOT EXISTS `settlement`(
  `settlement_id` int NOT NULL AUTO_INCREMENT,
  `bet_id` varchar(255) DEFAULT NULL,
  `lobby_id` varchar(255) DEFAULT NULL,
  `pins` int NOT NULL,
  `section` ENUM('Green', 'Yellow', 'Red') NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `operator_id` varchar(255) DEFAULT NULL,
  `bet_amount` decimal(10, 2) DEFAULT 0.00,
  `max_mult` decimal(10, 2) DEFAULT 0.00,
  `win_amount` decimal(10, 2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`settlement_id`)
);

 ALTER TABLE `plinko_game`.`settlement` ADD INDEX `inx_bet_id` (`bet_id` ASC) VISIBLE, ADD INDEX `inx_lobby_id` (`lobby_id` ASC) VISIBLE, ADD INDEX `inx_user_id` (`user_id` ASC) INVISIBLE, ADD INDEX `inx_operator_id` (`operator_id` ASC) INVISIBLE, ADD INDEX `inx_bet_amount` (`bet_amount` ASC) INVISIBLE, ADD INDEX `inx_max_mult` (`max_mult` ASC) INVISIBLE;

  CREATE TABLE `config_master` (
   `id` int NOT NULL AUTO_INCREMENT,
   `data_key` varchar(60) NOT NULL,
   `value` json NOT NULL,
   `is_active` boolean default 1,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=1627 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

 INSERT INTO config_master (`data_key`, `value`) VALUES('multiplier_values', '{"12":{"Green":[11,3.2,1.6,1.2,1.1,1,0.5,1,1.1,1.2,1.6,3.2,11],"Yellow":[25,8,3.1,1.7,1.2,0.7,0.3,0.7,1.2,1.7,3.1,8,25],"Red":[141,25,8.1,2.3,0.7,0.2,0,0.2,0.7,2.3,8.1,25,141]},"14":{"Green":[18,3.2,1.6,1.3,1.2,1.1,1,0.5,1,1.1,1.2,1.3,1.6,3.2,18],"Yellow":[55,12,5.6,3.2,1.6,1,0.7,0.2,0.7,1,1.6,3.2,5.6,12,55],"Red":[353,49,14,5.3,2.1,0.5,0.2,0,0.2,0.5,2.1,5.3,14,49,353]},"16":{"Green":[35,7.7,2.5,1.6,1.3,1.2,1.1,1,0.4,1,1.1,1.2,1.3,1.6,2.5,7.7,35],"Yellow":[118,61,12,4.5,2.3,1.2,1,0.7,0.2,0.7,1,1.2,2.3,4.5,12,61,118],"Red":[555,122,26,8.5,3.5,2,0.5,0.2,0,0.2,0.5,2,3.5,8.5,26,122,555]}}');
