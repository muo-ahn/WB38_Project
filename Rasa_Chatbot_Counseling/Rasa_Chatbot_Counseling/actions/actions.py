from rasa_sdk import Action
from rasa_sdk.events import ConversationPaused
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from datetime import datetime
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import UserUtteranceReverted, SlotSet
import yaml
import actions.function as function
from operator import eq

# YAML 파일 로드(정보 안내 말씀)
with open('actions\\Information.yml', 'r', encoding='utf-8') as file:
    yaml_data_info = yaml.safe_load(file)

# YAML 파일 로드(질병 관련)
with open('actions\\Disease_info.yml', 'r', encoding='utf-8') as file:
    yaml_data = yaml.safe_load(file)


# 이 액션은 사용자의 질문에 대한 의도를 파악하지 못했을 때 실행
# requested_intent 슬롯을 사용합니다. 사용자의 다음 질문에 대한 의도를 추적하기 위해 이 슬롯을 활용할 수 있습니다.
#ActionFallback 액션에서 SlotSet("requested_intent", None)을 사용하는 이유는
# 챗봇이 사용자의 질문에 대한 의도를 파악하지 못했음을 나타내기 위함입니다. 
# 이렇게 슬롯을 초기화하면 사용자의 다음 질문에 대한 의도를 추적하고, 적절한 응답을 제공할 수 있습니다.
# 따라서, "requested_intent" 슬롯은 Rasa가 자동으로 관리하는 슬롯이며, 별도로 설정할 필요는 없습니다. 
# ActionFallback 액션에서 슬롯을 초기화하는 코드를 사용함으로써 의도 파악에 대한 초기화를 수행할 수 있습니다.

class ActionDefaultFallback(Action):
    def name(self) -> Text:
        return "action_default_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(text="죄송합니다, 제가 이해하지 못했습니다. 다시 말씀해주시겠어요?")

        return []

#상담 종료 
class ActionEndConversation(Action):
    def name(self):
        return "action_end_conversation"

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message("더 필요한 것이 있으면 언제든지 문의해주십시오."+'\0')

        return []

# 질병 검사 결과 
class ActionDiseaseInspectionResult(Action):
    def name(self) -> Text:
        return "action_disease_Inspection_Result"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        try:    
            now = datetime.now()

            # 1. 질병 코드 정보 가져오기  
            disease_code_info = tracker.get_slot('disease_code')
            # 소문자로 변경 
            disease_code_info = disease_code_info.lower()
            print(f"disease_code_info:{disease_code_info}")
            
            # 질병 확률 정보 
            disease_probability_info = tracker.get_slot('disease_probability')
            print(f"disease_probability_info:{disease_probability_info}")
            
            # 질병 호전도 
            disease_improvement_info = tracker.get_slot('disease_improvement')
            
            # 정보를 정수로 바꿔주기 
            disease_improvement_info = int(disease_improvement_info)
            
            print(f"disease_improvement_info:{disease_improvement_info}")
            
            print(f"{disease_code_info}, 현재 시간: {now.date()} {now.time()}")
            
            disease_data = yaml_data[disease_code_info]['disease']
            
            if disease_code_info=='nor':
                dispatcher.utter_message(text=disease_data)
                return[]
                
            introduce = yaml_data_info['info_message']['introduce_chatbot']

            disease_inspection_Result_text = f"{disease_probability_info}% 확률로 {disease_data}이(가) 확인되었습니다.\n"
            
            disease_introduce_text = yaml_data[disease_code_info]['introduce']
            disease_improvement_text= yaml_data_info['info_improvement'][disease_improvement_info]
            print(disease_improvement_text)
            dispatcher.utter_message(text=introduce+disease_inspection_Result_text+disease_introduce_text+"\n"+disease_improvement_text)
                
        except Exception as ErrorMessage:
            ErrorMessage=str(ErrorMessage)
            dispatcher.utter_message(text="error")
            return [SlotSet("disease_code",None),SlotSet("disease_probability",None),SlotSet("disease_improvement",None) ]
        return []

# 질병 물어보기
class ActionRequest(Action):
    def name(self) -> Text:
        return "action_utter_request_disease"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
            
        # 1. 사용자 질의 가져오기 
        uesrMessage=tracker.latest_message.get('text')
        print(f"uesrMessage:{uesrMessage}")
        
        # replace 함수를 이용해서 공백 제거
        uesrMessage = uesrMessage.replace(" " ,"")
        
        # 2. 질병 키워드 가져오기 
        disease_keyword = function.get_diseaseKeyword(uesrMessage)
        print(f"disease_keyword:{disease_keyword}")
        
        # 질병 키워드 있는지 확인
        if disease_keyword is not None:
            try:
                # 기존 질병 코드 가져오기
                diseasecode_info = tracker.get_slot('disease_code')
                print(diseasecode_info)
                
                # 질병 데이터 가져오기
                disease_data_info = yaml_data[diseasecode_info][disease_keyword]
                print(disease_data_info)
                
                # 메시지 출력
                dispatcher.utter_message(text=disease_data_info)
                
                # disease_name,disease_info_keyword_cause슬롯값 초기화,
                # 현재 받아온 코드를 통해서 disease_code에 저장 
                return[]
            
            except Exception as ErrorMessage:
                None_information=('error \n')
                print(f'exception:{str(ErrorMessage)}')
                dispatcher.utter_message(text= None_information)
                return[]

        # 만약 질병 관련 키워드가 없다면 안내 문장 
        else:
            None_intent_str=yaml_data_info['info_message']['intent_error']
            dispatcher.utter_message(text=None_intent_str)
            return[]
        return []

# # 질병 치료법 물어보기
# class ActionRequestTreatment(Action):
#     def name(self) -> Text:
#         return "action_utter_request_disease_treatment"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
      
#         # 질병 치료 키워드 가져오기 
#         diseasetreatment_info= tracker.get_slot('disease_info_keyword_treatment')
        
#         # 사용자의 말 가져오기 
#         uesrMessage=tracker.latest_message.get('text')
        
#         print("uesrMessage:" +uesrMessage)
        
#         # replace 함수를 이용해서 공백 제거
#         uesrMessage = uesrMessage.replace(" ","")
        
#         # 질병 치료 키워드 있는지 확인
#         if ("치료" in uesrMessage) or ("조치" in uesrMessage):
          
#           try:
#             # YAML 파일 로드
#             with open('actions\Disease_info.yml', 'r', encoding='utf-8') as file:
#               yaml_data = yaml.safe_load(file)
              
#             # 질병 이름 가져오기 
#             diseaename_info = tracker.get_slot('disease_name')
            
#             # 만약 질병 이름 슬롯에 값이 없으면 기존 질병 코드에서 가져오기 
#             if diseaename_info is None:
#               diseasecode_info = tracker.get_slot('disease_code')
              
#             else:
#               # 질병 이름 슬롯에 값이 있으면 질병 이름을 통해서 질병 코드 가져오기
#               diseasecode_info= function.get_disease_key(diseaename_info)
              
#             print("칠병 치료 인텐트 이름:"+str(diseaename_info))
            
#             # YAML 데이터 가져오기(treatment)
#             disease_data_treatment= yaml_data[diseasecode_info]['treatment']
            
#             # 메시지 출력 
#             dispatcher.utter_message(text=disease_data_treatment)
            
#             #disease_name, disease_info_keyword_treatment 슬롯값 초기화,
#             #현재 받아온 코드를 통해서 disease_code에 저장 
#             return[SlotSet("disease_name",None), SlotSet("disease_code",diseasecode_info), SlotSet("disease_info_keyword_treatment",None)]
          
#           except KeyError:
#             None_information=('죄송하지만 질문하신 {0}에 관한 치료는 알 수 없습니다.\n'.format(diseaename_info))
#             None_information= None_information + Informaion_diseaseCode
#             dispatcher.utter_message(text= None_information)
#             return[SlotSet("disease_name",None), SlotSet("disease_info_keyword_treatment",None)]
#                 # 만약 질병 원인 키워드가 없다면 안내 문장 
#         else:
#           #메시지 출력
#           dispatcher.utter_message(text="치료 인텐트: 이런식의 키워드를 말씀해주세요: \"원인\", \"이유\", \"치료\", \"관리\" ")
#           return[SlotSet("disease_name",None)]
        
#         return []
      

# # 질병 추후 관리 응답
# class ActionRequestManagement(Action):
#     def name(self) -> Text:
#         return "action_utter_request_disease_management"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
      
#         # 질병 원인 키워드 가져오기 
#         diseasemanagement_info= tracker.get_slot('disease_info_keyword_management')
        
#         # 사용자의 말 가져오기 
#         uesrMessage=tracker.latest_message.get('text')
        
#         print("uesrMessage:" +uesrMessage)
        
#         # replace 함수를 이용해서 공백 제거
#         uesrMessage = uesrMessage.replace(" " ,"")
        
#         # 질병 관리 키워드 있는지 확인
#         if ("관리" in uesrMessage) or ("유지" in uesrMessage):
#           try:
#             # YAML 파일 로드
#             with open('actions\Disease_info.yml', 'r', encoding='utf-8') as file:
#               yaml_data = yaml.safe_load(file)
              
#             # 질병 이름 가져오기 
#             diseaename_info = tracker.get_slot('disease_name')
            
#             # 만약 질병 이름 슬롯에 값이 없으면 기존 질병 코드에서 가져오기 
#             if diseaename_info is None:
#               diseasecode_info = tracker.get_slot('disease_code')
              
#             else:
#               # 질병 이름 슬롯에 값이 있으면 질병 이름을 통해서 질병 코드 가져오기
#               diseasecode_info= function.get_disease_key(diseaename_info)
              
#             print("칠병 관리 인텐트 이름:"+str(diseaename_info))
            
#             # YAML 데이터 가져오기(management)
#             disease_data_management= yaml_data[diseasecode_info]['management']
            
#             # 메시지 출력 
#             dispatcher.utter_message(text=disease_data_management)
            
#             #disease_name, disease_info_keyword_treatment슬롯값 초기화,
#             #현재 받아온 코드를 통해서 disease_code에 저장 
#             return[SlotSet("disease_name",None), SlotSet("disease_code",diseasecode_info), SlotSet("disease_info_keyword_treatment",None)]
          
#           except KeyError:
#             None_information=('죄송하지만 질문하신 {0}에 관한 관리법은 알 수 없습니다.\n'.format(diseaename_info))
#             None_information= None_information + Informaion_diseaseCode
#             dispatcher.utter_message(text= None_information)
#             return[SlotSet("disease_name",None), SlotSet("disease_info_keyword_treatment",None)]
          
#         else:
#           # 만약 질병 키워드가 없다면 안내 문장
#           #메시지 출력
#           dispatcher.utter_message(text="관리 인텐트: 이런식의 키워드를 말씀해주세요: \"원인\", \"이유\", \"치료\", \"관리\" ")
#           return[SlotSet("disease_name",None)]
        
#         return []
      
      