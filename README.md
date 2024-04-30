# My Recipe Book

## Resource

**Recipe**

Attributes:

* Name
* Cook Time
* Type
* Ingredients
* Instructions

## Users

**User**
 
Attributes:

* First
* Last
* Email
* Password

## REST Endpoints

Name                        | Method | Path
----------------------------|--------|------------------
Retrieve Recipes collection | GET    | /recipes
Retrieve Recipe member      | GET    | /recipes/recipeID
Create Recipe member        | POST   | /recipes
Update Recipe member        | PUT    | /recipes/recipeID
Delete Recipe member        | DELETE | /recipes/recipeID
Create User		    | POST   | /users
Login (Create Session)      | POST   | /session
Logout (Delete Session)     | DELETE | /session
