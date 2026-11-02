@JIRA-EPIC:HDPD-582 @regression

Feature: Validate Your notice proposing a new rent Page
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
        When I click "Landlord's notice proposing a new rent" link
         Then I check that the text "Do you have a landlord's notice proposing a new rent to upload?" is displayed on the page
        When I select "Yes" for the question "Do you have a landlord's notice proposing a new rent to upload?"
        And  I click 'Save and continue'
        Then I check that the text "Upload your landlord’s notice proposing a new rent" is displayed on the page
        When I upload "supported-file"
        And  I click 'Save and continue'
        Then I check that the text "Your notice proposing a new rent" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-811
    Scenario: Navigate to Hardship page when Yes is selected

        And I check that the text "Your landlord must give you a valid section 13 notice before increasing your rent." is displayed on the page
        And I check that the text "A valid section 13 notice must:" is displayed on the page
        And I check that the text "give the correct notice period (at least 2 months)" is displayed on the page
        And I check that the text "not increase the rent within 52 weeks of the last increase" is displayed on the page
        And I check that the text "start the increase on the correct date" is displayed on the page
        And I check that the text "include your correct details, such as your name and address" is displayed on the page
        And I check that the text "be signed by the landlord" is displayed on the page
        And I check that the text "You can still challenge the rent increase even if the notice is valid." is displayed on the page
        And I check that the text "be signed by the landlord" is displayed on the page
        And I check that the text "You can still challenge the rent increase even if the notice is valid." is displayed on the page
        And I check that the text "If you think the notice is not valid, you must still submit this market rent determination application." is displayed on the page
        And I check that the text "Do you think the notice is legally valid?" is displayed on the page
        When I select "Yes" for the question "Do you think the notice is legally valid?"
        And I click "Save and continue"
        Then I check that the text "Hardship" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-812
    Scenario: Display text area when No is selected

        When I select "No" for the question "Do you think the notice is legally valid?"
        Then I check that the text "Explain why the notice is not legally valid (optional)" is displayed on the page
        Then I check that the text "You can upload supporting evidence next" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-814
    Scenario: Navigate to Upload Evidence page when No is selected and explanation provided

        When I select "No" for the question "Do you think the notice is legally valid?"
        And I enter "some documents is missing" for the label "Explain why the notice is not legally valid (optional)"
        And I click "Save and continue"
        Then I check that the text "Upload evidence to show why you think the notice is not legally valid (optional)" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-815
    Scenario: Navigate to Upload Evidence page when No is selected and explanation not provided


        When I select "No" for the question "Do you think the notice is legally valid?"
        And I click "Save and continue"
        Then I check that the text "Upload evidence to show why you think the notice is not legally valid (optional)" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-817
    Scenario: Save for later

        When I select "No" for the question "Do you think the notice is legally valid?"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC6 @JIRA-TEST-KEY:PTSD-820
    Scenario: Validation error when no option is selected

        When I click "Save and continue"
        Then I check that the error message "Select whether you think the notice is legally valid" is displayed on the page
