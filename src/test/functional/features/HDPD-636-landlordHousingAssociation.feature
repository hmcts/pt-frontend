@JIRA-EPIC:HDPD-636
Feature: Landing is a House Association

  @AC1 @JIRA-TEST-KEY:PTSD-440
  Scenario: Citizen selects No
    Given the citizen is on the landlord housing association page
    When the citizen selects No
    And the citizen clicks Continue
    Then the citizen is taken to the IDAM account creation page

  @AC2 @JIRA-TEST-KEY:PTSD-441
  Scenario: Citizen selects Yes
    Given the citizen is on the landlord housing association page
    When the citizen selects Yes
    And the citizen clicks Continue
    Then the citizen is taken to the you need to use another form page

  @AC3 @JIRA-TEST-KEY:PTSD-442
  Scenario: Citizen does not select an option
    Given the citizen is on the landlord housing association page
    And the citizen clicks Continue
    Then the standard validation message is displayed
