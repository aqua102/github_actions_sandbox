from src.greet import greet


def test_greet_default():
    assert greet() == "Hello, World!"


def test_greet_name():
    assert greet("Dan") == "Hello, Dan!"
    

def test_dwc():
    return "this is test dwc!"