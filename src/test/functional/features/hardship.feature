@JIRA-EPIC:HDPD-584 @regression

Feature: Would a rent increase on the proposed start date cause you hardship?

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
        Then I check that the text "Have landlord's notice?" is displayed on the page
        And I click "Save and continue"
        When I upload "supported-file"
        And  I click 'Save and continue'
        Then I check that the text "Your notice proposing a new rent" is displayed on the page
        When I select "Yes" for the question "Do you think the notice is legally valid?"
        And I click "Save and continue"
        Then I check that the text "Hardship" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-846
    Scenario: Verify page content

        Then I check that the text "If the tribunal agrees with the landlord's proposed market rent, it can delay the new rent date if it thinks you will experience hardship." is displayed on the page
        And I check that the text "If you want the tribunal to delay the new rent date, you must provide full details of your financial circumstances." is displayed on the page
        And I check that the text "Will a rent increase on the proposed start date cause you hardship?" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-847
    Scenario: Verify Save and Continue with Yes selected

        When I select "Yes" for the question "Will a rent increase on the proposed start date cause you hardship?"
        And I enter "experiance was good" for the label "Tell us how you would experience financial hardship if the rent was increased on the proposed start date (optional)"
        And I click "Save and continue"
        Then I check that the text "Upload your supporting evidence for how you would experience hardship (optional)" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-847
    Scenario: Verify Save and Continue with No selected

        When I select "No" for the question "Will a rent increase on the proposed start date cause you hardship?"
        And I click "Save and continue"
        Then I check that the text "Check your answers" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-848
    Scenario: Verify Save for Later

        When I select "Yes" for the question "Will a rent increase on the proposed start date cause you hardship?"
        And I click "Save for later"
        Then check that the user is redirected to the task-list citizen dashboard page

    @AC5 @JIRA-TEST-KEY:PTSD-849
    Scenario: Verify validation when no radio button is selected

        When I click "Save and continue"
        Then I check that the error message "Select whether you think a rent increase on the proposed start date will cause you hardship" is displayed on the page