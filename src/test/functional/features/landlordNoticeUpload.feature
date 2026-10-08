Feature: Landlord Notice Upload Question

  Background:
    Given the user navigates to PT url
    And the user has successfully logged on to market-rent-determination application
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
    And I click "Continue"
    Then check that the user is redirected to the "tenancy-type" page
    And I select the option "Assured periodic tenancy"
    And I click "Continue"
    Then check that the user is redirected to the task-list citizen dashboard page
    Given the citizen is on the Landlord Notice Upload page

  @AC1 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Verify page content
    Then the landlord notice upload page content is displayed

  @AC2 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Verify conditional reason field when No selected
    When the citizen selects No option
    Then the reason text area is displayed

  @AC3 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Save and continue with Yes selected
    When the citizen selects Yes option
    And I click "Save and continue"
    Then the citizen is redirected to Upload your notice proposing a new rent page

  @AC4 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Save and continue with No selected and valid reason
    When the citizen selects No option
    And the citizen enters notice upload reason "Notice not available from landlord"
    And I click "Save and continue"
    Then the citizen is redirected to Your notice proposing a new rent page

  @AC5 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Error when no option selected
    When I click "Save and continue"
    Then the error message "Select whether you have a notice proposing a new rent to upload" is displayed

  @AC5 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Error when No selected and reason empty
    When the citizen selects No option
    And I click "Save and continue"
    Then the error message "Enter why you cannot upload a notice proposing a new rent" is displayed

  @AC5 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Error when reason contains only one character
    When the citizen selects No option
    And the citizen enters notice upload reason "a"
    And I click "Save and continue"
    Then the error message "Your reasons why must be 2 characters or more" is displayed

  @AC5 @JIRA-TEST-KEY:HDPD-XXX
  Scenario: Error when reason exceeds 500 characters
    When the citizen selects No option
    And the citizen enters notice upload reason "<501-character-string>"
    And I click "Save and continue"
    Then the error message "Your reasons why must be 500 characters or less" is displayed