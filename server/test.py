import sys;

def add(x, y):
    return x + y
if __name__ == "__main__":
    a = int(sys.argv[1])
    b = int(sys.argv[2])
    print(add(a, b))