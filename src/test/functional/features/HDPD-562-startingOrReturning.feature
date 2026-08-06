@JIRA-EPIC:HDPD-562
Feature: Starting or Returning Application

  Background:
    Given the citizen is on the Starting Or Returning Application page

  @AC1 @JIRA-TEST-KEY:PTSD-651
  Scenario: User selects start a new application
    When the citizen selects start a new application
    Then the citizen is taken to the apply for yourself or someone else page

  @AC2 @JIRA-TEST-KEY:PTSD-657
  Scenario: User selects return to an application
    When the citizen selects return to an application
    Then the citizen is taken to the sign in or create account page

  @AC3 @JIRA-TEST-KEY:PTSD-504
  Scenario: User clicks continue without selecting an option
    When the citizen clicks continue without selecting an option
    Then the citizen  can see the standard UCD validation message
