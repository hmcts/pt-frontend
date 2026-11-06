@JIRA-EPIC:HDPD-1011 @regression

Feature: Create application type triage questions

    Background:
        Given I am on the "What type of application do you want to make" page
        Then I check that the text "Application type" is displayed on the page
        Then I check that the text "If you are challenging a rent increase, you can also challenge the legal validity of the landlord's notice. You can either challenge this as part of your open market determination application or only challenge the legal validity of the landlord's notice." is displayed on the page

    @AC1 @JIRA-TEST-KEY:PTSD-761
    Scenario: Open market rent determination application

        When I select "Open market rent determination application" for the question "Which application do you want to make?"
        And  I click 'Continue'
        Then I check that the text "Who is named on your tenancy agreement" is displayed on the page

    @AC2 @JIRA-TEST-KEY:PTSD-762
    Scenario: Challenge legal validity of landlord notice

        When I select "Only challenge the legal validity of a landlord's notice proposing a new rent" for the question "Which application do you want to make?"
        And I click 'Continue'
        Then I check that the text "Only challenging the legal validity of the landlord's notice" is displayed on the page

    @AC3 @JIRA-TEST-KEY:PTSD-763
    Scenario: No option selected

        When I click 'Continue'
        Then I check that the error message "Select which application you want to make" is displayed on the page