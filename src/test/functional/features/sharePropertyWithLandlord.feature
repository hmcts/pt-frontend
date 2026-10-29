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
        Then I check that the text "Do you share the property with your landlord?" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-914
    Scenario: Verify share property with landlord page content

        Then I check that the text "For example, if you have had limited or exclusive access to rooms, facilities or other features" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-915
    Scenario: Verify textarea is displayed when Yes is selected

        When I select "Yes" for the question "Do you share the property with your landlord?"
        Then I check that the text "Tell us how you share the property with the landlord" is displayed on the page
        

    @AC3 @JIRA-TEST-KEY:PTSD-916
    Scenario: Verify Save and Continue with Yes selected

        When I select "Yes" for the question "Do you share the property with your landlord?"
        And I enter "I share via post" for the label "Tell us how you share the property with the landlord"
        And I click "Save and continue"
        Then I check that the text "Upload a photo of the outside of the property (optional)" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-916
    Scenario: Verify Save and Continue with No selected

        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        Then I check that the text "Upload a photo of the outside of the property (optional)" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-917
    Scenario: Verify Save for Later

        When I select "Yes" for the question "Do you share the property with your landlord?"
        And I enter "I share via post" for the label "Tell us how you share the property with the landlord"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC5 @JIRA-TEST-KEY:PTSD-918
    Scenario: Verify validation when no radio option selected

        When I click "Save and continue"
        Then I check that the error message "Select whether you share the property with your landlord" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-918
    Scenario: Verify validation when Yes selected and details are blank

        When I select "No" for the question "Do you share the property with your landlord?"
        And I click "Save and continue"
        Then I check that the text "Upload a photo of the outside of the property (optional)" is displayed on the page
        

    @AC7 @JIRA-TEST-KEY:PTSD-918
    Scenario: Verify validation when details are below minimum length

        When I select "Yes" for the question "Do you share the property with your landlord?"
        And I enter " " for the label "Tell us how you share the property with the landlord"
        And I click "Save and continue"
        Then I check that the error message "Enter how you share the property with your landlord" is displayed on the page