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
        When I click "Property details" link
        Then check that the user is redirected to the property-details page
        And I enter first line of address as "100"
        And I enter second line of address as "Test Street"
        And I enter town or city as "London"
        And I enter postcode as "E1 1AA"
        And I click "Save and continue"
        When I select "Fully detached house" for the question "What are you renting?"
        And I click "Save and continue"
        When I select "No" for the question "Do you have a floor plan of the property?"
        And I enter room sizes as "Room 1: 10x10, Room 2: 12x12" for the question "Tell us the number and type of rooms, and their sizes (optional)"
        And I click "Save and continue"
        And I click "Save and continue"
        When I select "No" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I select "No" for the question "Is furniture provided in your tenancy?"
        And I click "Save and continue"
        When I select "No" for the question "Are any services provided in your tenancy?"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that the text "Repairs and improvements" is displayed on the page
        And I check the page for accessibility issues



    @AC1 @JIRA-TEST-KEY:PTSD-856
    Scenario: Verify repairs and improvements page content

        Then I check that the text "Tell us if you or any past tenants have made any improvements, or replaced fixing, fittings or furniture. Only include improvement or repair work you or the other tenants were not responsible for under the terms of the tenancy." is displayed on the page
        Then I check that the text "Have you or any past tenants made any changes or repairs to the property?" is displayed on the page
        And I check the page for accessibility issues

    @AC2 @JIRA-TEST-KEY:PTSD-857
    Scenario: Verify Save and Continue when Yes is selected

        When I select "Yes" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then I check that the text "Upload evidence of the improvements or repairs (optional)" is displayed on the page
        And I check the page for accessibility issues

    @AC3 @JIRA-TEST-KEY:PTSD-858
    Scenario: Verify Save and Continue when No is selected

        When I select "No" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page
        And I check the page for accessibility issues

    @AC4 @JIRA-TEST-KEY:PTSD-858
    Scenario: Verify Save and Continue when I'm not sure is selected

        When I select "I'm not sure" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page
        And I check the page for accessibility issues

    @AC5 @JIRA-TEST-KEY:PTSD-859
    Scenario: Verify Save for Later

        When I select "Yes" for the question "Have you or any past tenants made any changes or repairs to the property?"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        And I check the page for accessibility issues

    @AC6 @JIRA-TEST-KEY:PTSD-860
    Scenario: Verify validation when no option is selected

        When I click "Save and continue"
        Then I check that the error message "Select whether you or any past tenants made any changes or repairs to the property" is displayed on the page
        And I check the page for accessibility issues