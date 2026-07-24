@HDPD-562 @createapplication
Feature: Starting or Returning Application

  Background:
    Given the citizen is on the Starting Or Returning Application page

  @AC1
  Scenario: User selects start a new application
    When the citizen selects start a new application
    Then the citizen is taken to the apply for yourself or someone else page

  @AC2
  Scenario: User selects return to an application
    When the citizen selects return to an application
    Then the citizen is taken to the sign in or create account page

  @AC3
  Scenario: User clicks continue without selecting an option
    When the citizen clicks continue without selecting an option
    Then the citizen  can see the standard UCD validation message
