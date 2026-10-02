@JIRA-EPIC:HDPD-636
Feature: Landing is a House Association

Background:
    Given the citizen is on the landlord housing association page

  @AC1 @JIRA-TEST-KEY:PTSD-440
  Scenario: Citizen selects No
    When the citizen selects No
    And the citizen clicks Continue
    Then the citizen is taken to application type page

  @AC2 @JIRA-TEST-KEY:PTSD-441
  Scenario: Citizen selects Yes
     When the citizen selects Yes
    And the citizen clicks Continue
    Then the citizen is taken to the you need to use another form page

  @AC3 @JIRA-TEST-KEY:PTSD-442
  Scenario: Citizen does not select an option
    And the citizen clicks Continue
    Then the standard validation message is displayed
