@JIRA-EPIC:HDPD-617 @regression

Feature: Validate  What repairs are the landlord's responsibility Page

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


    @AC1 @JIRA-TEST-KEY:PTSD-931
    Scenario: Verify landlord repairs page content
        Given the citizen is on the Landlord Repairs page
        Then the landlord repairs page displays all expected content


    @AC2 @JIRA-TEST-KEY:PTSD-932
    Scenario: Verify Save and continue with details entered
        Given the citizen is on the Landlord Repairs page
        When the citizen enters landlord repair details
        Then check that the user is redirected to the "tenant-repairs-responsibility" page


    @AC3 @JIRA-TEST-KEY:PTSD-933
    Scenario: Verify Save and continue with blank textarea
        Given the citizen is on the Landlord Repairs page
        Then no validation message is displayed
        And check that the user is redirected to the "tenant-repairs-responsibility" page