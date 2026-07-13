Feature: Initial Functional test

   Scenario: Require log in to access the home page
      When I go to '/'
      Then the page should include 'Sign in or create an account'
