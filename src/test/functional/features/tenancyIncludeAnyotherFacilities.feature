@JIRA-EPIC:HDPD-611 @regression @WIP

Feature: Validate Does the tenancy include any other facilities page

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
        And I click "Save and continue"
        And I click "Save and continue"
        Then I check that the text "Does the tenancy include any other facilities?" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-909
    Scenario: AC1 Verify page content

        Then I check that the text "For example, a garden, garage, separate buildings or land" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-910
    Scenario: AC2 Verify conditional reveal when Yes is selected

        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        Then I check that the text "What other facilities does your tenancy include?" is displayed on the page
        

    @AC3 @JIRA-TEST-KEY:PTSD-911
    Scenario: AC3 Verify Save and Continue with Yes selected

        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And I enter "other amenities like gaming area and garden" for the label "What other facilities does your tenancy include?"
        And I click "Save and continue"
        Then I check that the text "Do you share the property with your landlord?" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-911
    Scenario: AC3 Verify Save and Continue with No selected

        When I select "No" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        Then I check that the text "Do you share the property with your landlord?" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-912
    Scenario: AC4 Verify Save for Later

        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And I enter "other amenities like gaming area and garden" for the label "What other facilities does your tenancy include?"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page


    @AC6 @JIRA-TEST-KEY:PTSD-913
    Scenario: AC5 Verify validation when Yes selected and details not entered

        When I select "Yes" for the question "Does the tenancy include any other facilities?"
        And I click "Save and continue"
        Then I check that the error message "Enter what other facilities your tenancy includes" is displayed on the page