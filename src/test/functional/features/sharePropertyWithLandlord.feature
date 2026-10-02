@JIRA-EPIC:HDPD-612 @regression

Feature: Validate Do you share the property with the landlord Page

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

    @AC1 @JIRA-TEST-KEY:PTSD-914
    Scenario: Verify share property with landlord page content

        Given the citizen is on the Share Property With Landlord page
        Then the share property page displays all expected content

    @AC2 @JIRA-TEST-KEY:PTSD-915
    Scenario: Verify textarea is displayed when Yes is selected

        Given the citizen is on the Share Property With Landlord page
        When I select "Yes" for the question "Do you share the property with your landlord?"
        Then the share property details textarea is displayed

    @AC3 @JIRA-TEST-KEY:PTSD-916
    Scenario: Verify Save and Continue with Yes selected

        Given the citizen is on the Share Property With Landlord page
        When I select "Yes" for the question "Do you share the property with your landlord?"
        And the citizen enters share property details
        And I click "Save and continue"
        Then the citizen is navigated to the Upload a photo of the outside of the property page

    @AC3 @JIRA-TEST-KEY:PTSD-916
    Scenario: Verify Save and Continue with No selected

        Given the citizen is on the Share Property With Landlord page
        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        Then the citizen is navigated to the Upload a photo of the outside of the property page

    @AC4 @JIRA-TEST-KEY:PTSD-917
    Scenario: Verify Save for Later

        Given the citizen is on the Share Property With Landlord page
        When I select "Yes" for the question "Do you share the property with your landlord?"
        And the citizen enters share property details
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC5 @JIRA-TEST-KEY:PTSD-918
    Scenario: Verify validation when no radio option selected

        Given the citizen is on the Share Property With Landlord page
        And I click "Save and continue"
        Then I check that the error message "Select whether you share the property with your landlord" is displayed on the page
    @AC6 @JIRA-TEST-KEY:PTSD-918
    Scenario: Verify validation when Yes selected and details are blank

        Given the citizen is on the Share Property With Landlord page
        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        Then the citizen is navigated to the Upload a photo of the outside of the property page

    @AC7 @JIRA-TEST-KEY:PTSD-918
    Scenario: Verify validation when details are below minimum length

        Given the citizen is on the Share Property With Landlord page
        When I select "Yes" for the question "Do you share the property with your landlord?"
        And the citizen enters " " in textarea
        And I click "Save and continue"
        Then I check that the error message "Enter how you share the property with your landlord" is displayed on the page