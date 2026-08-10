## find all repo belonging to a particular user 
MY approach - we have given two tables here user , repo so inorder to find all repo belonging to particular user we must to combine both tabel through inner join because we want all user who have repo because if we use another that could contain null values  .

solution -  SELECT username,repositiory_name, default_branch FROM user u LEFT JOIN repositiory r ON u.id = r.user_id 

##  count all repo particular user have 

my approach - as we know first we have to combine it so that we can access of repo table after that we can group by so that all user id get come together and we can count them in short we can use aggregate function 

solution - SELECT username, count(*) As repo_count FROM user u LEFT JOIN repositiory r ON u.id = r.user_id GROUP BY u.username;

## find user who have more than 5 repo 

my approach - first we have to combine them so that we can access repo table data and after that we have to use group by so that all user id get come together and we can count them in short we can use aggregate function and last we have to use having function to filter them

solution - SELECT u.username, count(r.id) as repo_count 
FROM user u 
LEFT JOIN repositiory r ON u.id = r.user_id 
GROUP BY u.id, u.username 
HAVING count(r.id) > 5;

## Find all jobs whose attempt_count is greater than the average attempt count across all jobs.

My Approach - first i will found the avg attempt count and then compare it with attempt count if it is greater than it will return.

SELECT job_name , attempt_count 
FROM jobs WHERE attempt_count>(SELECT AVG(attempt_count) FROM jobs);

##  For every repository, rank its jobs based on attempt_count, highest first.

my appraoch so here i need to use winodw function as we have to assign rank to each repo so here i will be using row number that will assign unique rank by the way question did'nt mention about tie case so i will use row number and then user over method so that i can do the partition of repo in short we have to make a group where each repo would have a seperate rank acording to the attempt count  
also i have to sort in decending order 

solution -> SELECT 
job_name, 
attempt_count,
ROW_NUMBER() OVER (PARTITION BY repository_id ORDER BY attempt_count DESC) AS rank
FROM jobs

## Top N per Group
my approach - as we need to count N per group here so to solve this problem i can use window function in which first will assign a rank to each group along with that i will sort it in decending order and make it as a table where i will perform subquery to get top of n repo by applying condition of r.row_no <= 3 like that or i can also use nested subquery but it is not efficient 

solution-> (SELECT repo_id,job_id , attempt_count,
DENSE_RANK() OVER (PARTITION BY repo_id ORDER BY attempt_count DESC) AS rnk
FROM jobs) r 
WHERE r.rnk <=3 ;

## latest record 
Find the repositories where:

The latest job failed, but the repository has had at least one successful job in the past. 

my-approch-> so here i have to use window function where i will use row no with over(partition by repo_id order by job_id desc) and status = failed  and status in group is success 
