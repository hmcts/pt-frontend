@JIRA-EPIC:HDPD-1021 @regression

Feature: Only challenging the legal validity of the landlord's notice

    Background:
        Given I am on the "What type of application do you want to make" page
        Then I check that the text "Application type" is displayed on the page
        Then I check that the text "If you are challenging a rent increase, you can also challenge the legal validity of the landlord's notice. You can either challenge this as part of your open market determination application or only challenge the legal validity of the landlord's notice." is displayed on the page
    #Need to check 
    # @AC1 @JIRA-TEST-KEY:PTSD-752 @WIP
    # Scenario: Download paper form

    #     When I select "Only challenge the legal validity of a landlord's notice proposing a new rent" for the question "Which application do you want to make?"
    #     And I click 'Continue'
    #     Then I check that the text "Only challenging the legal validity of the landlord's notice" is displayed on the page
    #     When I click "downloadable paper form to apply (PDF, 848KB)" link
    #     Then the citizen is taken to the paper application form

    @AC2 @JIRA-TEST-KEY:PTSD-753
    Scenario: View GOV.UK guidance

        When I select "Only challenge the legal validity of a landlord's notice proposing a new rent" for the question "Which application do you want to make?"
        And I click 'Continue'
        When the citizen selects the guidance on GOV.UK link
        Then the citizen is taken to the GOV.UK guidance page