@JIRA-TEST-KEY:PTSD-1024
Feature: Other charges page
  As a PT user
  I want to be authenticated to the PT upon entering my credentials in IDAM
  So that I can start my application.
 
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
    # Then I check that the user is redirected to the task-list citizen dashboard page
    # Then I nagivate to the other charges page
    # https://pt.aat.platform.hmcts.net/1789508197160507/tribunal-previously-determined-rent
    # And I select the option "Yes" for the question "Has the landlord previously determined the rent for this property?"
    # And I click "Continue"
    # And I select the option "Monthly" for the question "How often do you pay your rent?"
    # And I enter the value "1000" for the question "How much is current monthly rent?"
    # And I click "Continue"
    # And I select "Yes" for the question "Does your rent include council tax?"
    # And I click "Continue"
    # And I select "monthly" for the question "How often is council tax paid?"
    # And I select "Save and continue"
    # And I select "Yes" for the question "Does the rent include any charges for utilities?"
    # And I click "Save and continue"
    # And I select "Monthly" for the question "How often are utilities paid?"
    # And I enter date "01/01/2024" for the question "When did your current tenancy start?"
    # And I click "Save and continue"
    # And I enter date "01/01/2024" for the question "When did your current tenancy end?"
    # And I click "Save and continue"
    # And I select "Yes" for the question "Does your current tenancy replace an original tenancy?"
    # And I click "Save and continue"
    # And I select "Yes" for the question "Are you charged separately for anything else?"
    # And I click "Save and continue"
    # And I enter description "Test description" for Other charges
    # And I enter amount "100" for Other charges
