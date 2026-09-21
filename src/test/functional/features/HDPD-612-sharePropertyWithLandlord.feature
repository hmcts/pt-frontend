@HDPD-612
Feature: Do you share the property with the landlord

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

    @HDPD-612_1
    Scenario: Verify share property with landlord page content
        Given the citizen is on the Share Property With Landlord page
        Then the share property page displays all expected content


    Scenario: Verify textarea is displayed when Yes is selected
        Given the citizen is on the Share Property With Landlord page
        When the citizen selects share property Yes
        Then the share property details textarea is displayed

    @HDPD-612_3
    Scenario: Verify Save and Continue with Yes selected

        Given the citizen is on the Share Property With Landlord page
        When the citizen selects share property Yes
        And the citizen enters share property details
        And the citizen clicks share property Save and continue
        Then the citizen is navigated to the Upload a photo of the outside of the property page

    @HDPD-612_4
    Scenario: Verify Save and Continue with No selected
        Given the citizen is on the Share Property With Landlord page
        When the citizen selects share property No
        And the citizen clicks share property Save and continue
        Then the citizen is navigated to the Upload a photo of the outside of the property page

    @HDPD-612_5
    Scenario: Verify Save for Later
        Given the citizen is on the Share Property With Landlord page
        When the citizen selects share property Yes
        And the citizen enters share property details
        And the citizen clicks share property Save for later
        Then check that the user is redirected to the task-list citizen dashboard page
    @HDPD-612_6
    Scenario: Verify validation when no radio option selected
        Given the citizen is on the Share Property With Landlord page
        When the citizen clicks share property Save and continue
        Then the citizen sees the share property radio button validation error
    @HDPD-612_7
    Scenario: Verify validation when Yes selected and details are blank
        Given the citizen is on the Share Property With Landlord page
        When the citizen selects share property Yes
        And the citizen clicks share property Save and continue
        Then the citizen sees the share property mandatory details validation error

    @HDPD-612_8
    Scenario: Verify validation when details are below minimum length
        Given the citizen is on the Share Property With Landlord page
        When the citizen selects share property Yes
        And the citizen enters " " in textarea
        And the citizen clicks share property Save and continue
        Then the citizen sees the share property mandatory details validation error