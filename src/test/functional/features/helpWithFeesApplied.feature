@JIRA-EPIC:HDPD-625 @regression

Feature: Validate Have you already applied for help with your application fee? page

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
        When I click "Tell us if you are eligible for help with fees" link
        And I click "Save and continue"
        Then I check that the text "Have you already applied for help with your application fee?" is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-860
    Scenario: Verify page content

        Then I check that the text "If you have, you should have a reference number, for example, HWF-A1B-23C" is displayed on the page


    @AC2 @JIRA-TEST-KEY:PTSD-861
    Scenario: Verify reference number field is revealed when Yes is selected


        When I select "Yes" for the question "Have you already applied for help with your application fee?"
        Then I check that the text "Enter your help with fees reference number" is displayed on the page
        Then I check that the text "For example, HWF-A1B-23C" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-862
    Scenario: Verify citizen can continue with valid reference number

        When I select "Yes" for the question "Have you already applied for help with your application fee?"
        And I enter "HWF-A1B-23C" for the label "Enter your help with fees reference number"
        And I click "Save and continue"
        Then I check that the text "Check your answers - Help with fees" is displayed on the page

    @AC4 @JIRA-TEST-KEY:PTSD-863
    Scenario: Verify citizen can continue when No is selected

        When I select "No" for the question "Have you already applied for help with your application fee?"
        And I click "Save and continue"
        Then I check that the text "You need to apply for help with fees" is displayed on the page

    @AC5 @JIRA-TEST-KEY:PTSD-864
    Scenario: Verify error when no option is selected

        When I click "Save and continue"
        Then I check that the error message "Select whether you have already applied for help with your application fee" is displayed on the page

    @AC6 @JIRA-TEST-KEY:PTSD-865
    Scenario: Verify error when reference number is blank

        When I select "Yes" for the question "Have you already applied for help with your application fee?"
        And I click "Save and continue"
        Then I check that the error message "Enter your help with fees reference number" is displayed on the page

    @AC7 @JIRA-TEST-KEY:PTSD-865
    Scenario: Verify error when invalid reference number is entered

        When I select "Yes" for the question "Have you already applied for help with your application fee?"
        And I enter "HWFA1B23C" for the label "Enter your help with fees reference number"
        And I click "Save and continue"
        Then I check that the error message "Help with fees reference number must be in the correct format, like HWF-A1B-23C" is displayed on the page