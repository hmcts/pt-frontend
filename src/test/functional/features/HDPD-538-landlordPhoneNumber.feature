
@HDPD-538
Feature: your landlord's phone number

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

    Scenario: Verify validation when invalid phone number is entered
        Given the citizen is on the Landlord Phone Number page
        When the citizen enters an invalid landlord phone number
        And the citizen clicks landlord phone Save and continue
        Then the citizen sees the landlord phone number validation error

    Scenario: Verify citizen can continue when landlord phone number is blank
        Given the citizen is on the Landlord Phone Number page
        When the citizen leaves the landlord phone number blank
        And the citizen clicks landlord phone Save and continue
        Then the citizen is navigated to the Does your landlord have a letting agent or representative page


    Scenario: Verify Save for Later with valid phone number
        Given the citizen is on the Landlord Phone Number page
        When the citizen enters a valid landlord phone number
        And the citizen clicks landlord phone Save for later
         Then check that the user is redirected to the task-list citizen dashboard page

    Scenario: Verify Save and Continue with valid phone number
        Given the citizen is on the Landlord Phone Number page
        When the citizen enters a valid landlord phone number
        And the citizen clicks landlord phone Save and continue
        Then the citizen is navigated to the Does your landlord have a letting agent or representative page