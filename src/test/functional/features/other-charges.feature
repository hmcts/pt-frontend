@JIRA-TEST-KEY:PTSD-1024
Feature: Other charges page
  As a PT user
  I want to check that after signing in user lands on the 'my applications' page and user can navigate to the other charges page
 
  @JIRA-TEST-KEY:PTSD-1024
  Scenario: Other Charges page - Check that after signing in user lands on the 'my applications' page and user can navigate to the other charges page
    Given the user navigates to PT url
    And the user has successfully logged on to market-rent-determination application
    Then check that the user is redirected to the my-application page
    When user clicks on the my application link
    Then check that the user is redirected to the application-type page
    And I select the option "Challenge my rent as excessive within the first 6 months of the tenancy"
    And I click "Continue"
    Then check that the user is redirected to the "tenancy-type" page
    And I select the option "Assured periodic tenancy"
    And I click "Continue"
    Then check that the user is redirected to the task-list citizen dashboard page
    And I navigate to the other charges page
    And I select the option "Yes" for the question "Are you charged separately for anything else"
    And I click "Save and continue"
    And I add other charge details in description as "Charged for monthy house maintenance"
    Then I check that the text "You have 464 characters remaining" is displayed on the page
    And I click "Save and continue"
    And I click back link 
    And I enter characters more than 500 in the description field
    And I click "Save and continue"
    Then I check that the error message "Description of what you are charged separately for must be 500 characters or less" is displayed on the page
    And I click "Save for later"