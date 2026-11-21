@auth
Feature: Login
    To access my todos 
    as a registered user 
    I want to enter with my email and password

    Background:
        Given a registered user exists 
    
    Rule: Only registered users can access the application

    @smoke
    Scenario: Login with valid credentials 
    When the user logs in with valid credentials
    Then the user sees the list of todos 
    And the user sees their name

    Scenario: Login with wrong password 
    When the user logs in with the valid email and wrong password
    Then the user sees the message "Email ou password incorretos."
    And the user stays on the login page 

    @ui
    Scenario: Login with empty fields 
    When the user logs in with empty fields 
    Then the user sees the message "Preenche o email e a password."
    And the user stays on the login page

    Scenario: Access without active session
    When the visitor without a session opens the todo list
    Then the visitor is redirected to the Login page     

        


