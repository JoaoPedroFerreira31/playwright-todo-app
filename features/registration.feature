@registration
Feature: Registration
    In order to use the application
    As a new visitor 
    I want to create an account

    Rule: Only valid data creates an account

    Scenario Outline: Registration rejected with invalid data
        When the visitor registers with name "<name>", email "<email>", password "<password>" and confirmation "<confirm_password>"
        Then the visitor sees the message "<message>"

        Examples: Rejected by the API
            | name            | email              | password    | confirm_password           | message                                        |
            | Antonio Pedro   | teste@example.com  | passwor     | passwor                    | A password tem de ter pelo menos 8 caracteres. |
            |                 | teste@example.com  | password123 | password123                | O nome é obrigatório.                          |
            | Antonio Pedro   | testeexample.com   | password123 | password123                | Email inválido.                                |
        
        @ui    
        Examples: Rejected by the Form
            | name            | email              | password    | confirm_password           | message                                        |
            | Antonio Pedro   | teste@example.com  | password123 | password2364               | As passwords não coincidem.                    |            