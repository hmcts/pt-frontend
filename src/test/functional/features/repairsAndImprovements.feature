@JIRA-EPIC:HDPD-618 @regression

Feature: Validate Repairs and improvements Page

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


    @AC1 @JIRA-TEST-KEY:PTSD-856
    Scenario: Verify repairs and improvements page content
        Given the citizen is on the Repairs and Improvements page
        Then the repairs and improvements page displays all expected content

    @AC2 @JIRA-TEST-KEY:PTSD-857
    Scenario: Verify Save and Continue when Yes is selected
        Given the citizen is on the Repairs and Improvements page
        When I select "Yes" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then the citizen is navigated to the Upload evidence of the improvements or repairs page

    @AC3 @JIRA-TEST-KEY:PTSD-858
    Scenario: Verify Save and Continue when No is selected
        Given the citizen is on the Repairs and Improvements page
        When I select "No" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then the citizen is navigated to the Check your answers page

    @AC4 @JIRA-TEST-KEY:PTSD-858
    Scenario: Verify Save and Continue when I'm not sure is selected
        Given the citizen is on the Repairs and Improvements page
        When I select "I'm not sure" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then the citizen is navigated to the Check your answers page

    @AC5 @JIRA-TEST-KEY:PTSD-859
    Scenario: Verify Save for Later
        Given the citizen is on the Repairs and Improvements page
        When I select "Yes" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-860
    Scenario: Verify validation when no option is selected
        Given the citizen is on the Repairs and Improvements page
        When I click "Save and continue"
        Then I check that the error message "Select whether you or any past tenants made any changes or repairs to the property" is displayed on the page