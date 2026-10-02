@JIRA-EPIC:HDPD-615 @regression

Feature: Is furniture provided in your tenancy

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

    @AC1 @JIRA-TEST-KEY:PTSD-806
    Scenario: Verify furniture provided page content

        Given the citizen is on the Furniture Provided page
        Then the furniture page displays all expected content

    @AC2 @JIRA-TEST-KEY:PTSD-807
    Scenario: Verify furniture details textarea is displayed when Yes is selected

        Given the citizen is on the Furniture Provided page
        When I select "Yes" for the question "Is furniture provided in your tenancy?"
        Then the furniture details textarea is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-808
    Scenario: Verify Save and Continue with Yes selected

        Given the citizen is on the Furniture Provided page
        When I select "Yes" for the question "Is furniture provided in your tenancy?"
        And the citizen enters furniture details
        And I click "Save and continue"
        Then the citizen is navigated to the Are any services provided in your tenancy page

    @AC4 @JIRA-TEST-KEY:PTSD-809
    Scenario: Verify Save and Continue with No selected

        Given the citizen is on the Furniture Provided page
        When I select "No" for the question "Is furniture provided in your tenancy?"
        And I click "Save and continue"
        Then the citizen is navigated to the Are any services provided in your tenancy page

    @AC5 @JIRA-TEST-KEY:PTSD-810
    Scenario: Verify Save for Later from Furniture Provided page

        Given the citizen is on the Furniture Provided page
        When I select "Yes" for the question "Is furniture provided in your tenancy?"
        And the citizen enters furniture details
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-810
    Scenario: Verify validation when no furniture option is selected

        Given the citizen is on the Furniture Provided page
        When I click "Save and continue"
        Then I check that the error message "Select whether furniture is provided in your tenancy" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-810
    Scenario: Verify validation when Yes selected and furniture details are blank

        Given the citizen is on the Furniture Provided page
        When I select "Yes" for the question "Is furniture provided in your tenancy?"
        And I click "Save and continue"
        Then I check that the error message "Enter what furniture is provided in your tenancy" is displayed on the page

    @AC8 @JIRA-TEST-KEY:PTSD-810
    Scenario: Verify validation when furniture details are below minimum length

        Given the citizen is on the Furniture Provided page
        When I select "Yes" for the question "Is furniture provided in your tenancy?"
        And the citizen enters invalid furniture details
        And I click "Save and continue"
        Then I check that the error message "Details about furniture provided must be 2 characters or more" is displayed on the page
