@HDPD-1012
Feature: Page for Who is named on your tenancy agreement
    Scenario: Check that When user selects option as 'Tenant' then he is redirected to the IDAM account creation page.
        Given I am on the "Who is named on your tenancy agreement" page
        When I select the option "Tenant" under "Are you a tenant or joint tenant?"
        And I click "Continue"
        Then user is taken to the IDAM login page

    Scenario: Check that When user selects option as 'Joint-Tenant' or "I’m not sure" then he is redirected to the IDAM account creation page.
        
        Given I am on the "Who is named on your tenancy agreement" page
        When I select the option "Joint tenant" under "Are you a tenant or joint tenant?"
        And I click "Continue"
        Then user is taken to "You need to use another form to apply" page
        And I click "Back" link
        Then user is taken back to "Who is named on your tenancy agreement" page
        And I select the option "I’m not sure" under "Are you a tenant or joint tenant?"
        And I click "Continue"
        Then user is taken to "You need to use another form to apply" page
