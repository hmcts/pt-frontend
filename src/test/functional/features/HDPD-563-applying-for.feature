@JIRA-EPIC:HDPD-563
Feature: Are you applying for yourself or someone else?
  As a citizen
  I want to identify who I am applying for
  So that I can proceed through the correct journey

  Background:
   Given the citizen is on the Applying For page

  @AC1 @JIRA-TEST-KEY:PTSD-727
  Scenario: Citizen is applying for themselves
    When the citizen selects applying for myself
    And the citizen clicks Continue
    Then the citizen is taken to the postcode triage page

  @AC2 @JIRA-TEST-KEY:PTSD-511
  Scenario: Citizen is applying on behalf of someone else
    When the citizen selects applying on behalf of someone else
    And the citizen clicks Continue
    Then the citizen is taken to the another form guidance page

  @AC3 @JIRA-TEST-KEY:PTSD-685
  Scenario: Citizen continues without selecting an option
    When the citizen clicks Continue
    Then the citizen sees the standard UCD validation message
