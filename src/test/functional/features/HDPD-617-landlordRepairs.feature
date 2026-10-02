@JIRA-EPIC:HDPD-617
Feature: What repairs are the landlord's responsibility

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


    @HDPD-617_1
    Scenario: Verify landlord repairs page content
        Given the citizen is on the Landlord Repairs page
        Then the landlord repairs page displays all expected content


    @HDPD-617_2
    Scenario: Verify Save and continue with details entered
        Given the citizen is on the Landlord Repairs page
        When the citizen enters landlord repair details
        Then check that the user is redirected to the "tenant-repairs-responsibility" page


    @HDPD-617_3
    Scenario: Verify Save and continue with blank textarea
        Given the citizen is on the Landlord Repairs page
        Then no validation message is displayed
        And check that the user is redirected to the "tenant-repairs-responsibility" page