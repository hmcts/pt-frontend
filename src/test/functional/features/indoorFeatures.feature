@JIRA-EPIC:HDPD-610 @regression

Feature: Validate Indoor features Page

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
        Then I check that the text "Indoor features" is displayed on the page
        And I check the page for accessibility issues

    @AC1 @JIRA-TEST-KEY:PTSD-851
    Scenario: Verify indoor features page content

        Then I check that the text "Tell us about the property's indoor features (optional)" is displayed on the page
        And I check that the text "Tell us about the property's features, such as:" is displayed on the page
        And I check that the text "what type of heating it has" is displayed on the page
        And I check that the text "whether it has double glazing" is displayed on the page
        And I check that the text "what type of flooring it has (for example, carpet, tiles or wood flooring)" is displayed on the page
        And I check the page for accessibility issues

    @AC2 @JIRA-TEST-KEY:PTSD-854
    Scenario: Verify Save and Continue with indoor feature details

        When I enter "Indoor feature is provided" for the question "Tell us about the property's indoor features (optional)"
        And I click "Save and continue"
        Then I check that the text "Does the tenancy include any other facilities?" is displayed on the page
        And I check the page for accessibility issues

    @AC3 @JIRA-TEST-KEY:PTSD-854
    Scenario: Verify Save and Continue with blank indoor feature details

        When I click "Save and continue"
        Then I check that the text "Does the tenancy include any other facilities?" is displayed on the page
        And I check the page for accessibility issues

    @AC4 @JIRA-TEST-KEY:PTSD-855
    Scenario: Verify Save for Later

        When I enter "Indoor feature is provided" for the question "Tell us about the property's indoor features (optional)"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page
        And I check the page for accessibility issues

