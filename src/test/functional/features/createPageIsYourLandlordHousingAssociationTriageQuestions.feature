@JIRA-EPIC:HDPD-636 @regression
Feature: Validate landlord housing association page

  Background:
    Given I am on the landlord housing association page


  @AC1 @JIRA-TEST-KEY:PTSD-440
  Scenario: I select No radio button
    When I select "No" for the question "Is your landlord a housing association?"
    And  I click 'Continue'
    Then I check that the text "Application type" is displayed on the page

  @AC2 @JIRA-TEST-KEY:PTSD-441
  Scenario: I select Yes radio button
    When I select "Yes" for the question "Is your landlord a housing association?"
    And  I click 'Continue'
    Then I check that the text "You need to use another form to apply" is displayed on the page

  @AC3 @JIRA-TEST-KEY:PTSD-442
  Scenario: I do not select any option
    When  I click 'Continue'
    Then I check that the error message "Select whether your landlord is a housing association" is displayed on the page
