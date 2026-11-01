#include <string.h>
int main(int argc, char **argv) {
    char buffer[10];
    if (argc > 1) strcpy(buffer, argv[1]);
    return 0;
}
