# #!/bin/bash
while true; do
  sleep 5
  ./build.sh
done

# #!/bin/bash
# # script:  watchfiles
# # author:  Thiago Andrade <thiagoh@gmail.com>
# # license: GPLv3
# # description:
# #   watches the given paths for changes
# #   and executes a given command when changes occur
# # usage:
# #   watchfiles <cmd> <paths...>
# #
#
# interval=1
# verbose=0
# quiet=0
# cmd=""
# error_message=""
# error=0
#
# print_error() {
#
#   _error_message=$1
#   echo "Error: ${_error_message}" 1>&2;
# }
#
# check_error() {
#
#   if [ $error -eq 1 ]; then
#     print_error "${error_message}";
#     exit 1;
#   fi
# }
#
# show_help() {
#   echo "Usage: watchfiles [options] command [path1] [path2...]"
#   echo -e "    -t --interval\t\tInterval in seconds to wait until next check"
#   echo -e "    -q --quiet\t\t\tQuiet"
#   echo -e "    -qq --quietquiet\t\tSuper quiet"
#   echo -e "    -v --verbose\t\tVerbose (good for debug purposes)"
# }
#
# for i in "$@"; do
#   key="$1"
#   case $key in
#       -v|--verbose)
#       verbose=1
#       shift
#       ;;
#       -q|--quiet)
#       quiet=1
#       shift # past argument
#       ;;
#       -qq|--quietquiet)
#       quiet=2
#       shift # past argument
#       ;;
#       --help)
#       show_help
#       shift # past argument
#       exit 1;
#       ;;
#       -t)
#       interval="$2"
#       shift # past -t
#       shift # past value
#       ;;
#       --interval=*)
#       interval="${key#*=}"
#       shift # past argument=value
#       ;;
#       *)
#       cmd=$key
#       shift
#       break;
#       ;;
#   esac
# done
#
# path=$*
#
# # echo "interval $interval"
# # echo "cmd $cmd"
# # echo "path $path"
# # echo "verbose $verbose"
# # echo
# # echo
#
# re='^[0-9]+$'
# if ! [[ $interval =~ $re ]] ; then
#    error_message="Interval must be an integer"
#    error=1
# fi
#
# check_error
#
# if [ -z "$path" ]; then
#   error_message="No such files";
#   error=1
# fi
#
# check_error
#
# if [ $verbose -eq 1 ]; then
#   quiet=0
# fi
#
# update_sha() {
#   _path=$1
#
#   current_sha=`ls -lR --time-style=full-iso $_path | sha1sum |rev| cut -d' ' -f2-| rev`
#   echo $current_sha
#   return 0
# }
#
# check_files() {
#   tmp_path=""
#   counter=0
#   error_counter=0
#
#   for file in $path; do
#     if [ ! -f $file ]; then
#       echo "File ${file} does not exists! Skipping it." 1>&2;
#       ((error_counter=error_counter + 1))
#     else
#       tmp_path="$tmp_path $file"
#     fi
#     ((counter=counter + 1))
#   done
#
#   if [ $counter -eq $error_counter ]; then
#     error=1
#     error_message="No such existing or valid files"
#     return 1;
#   fi
#
#   if [ $counter -eq 0 ]; then
#     error=1
#     error_message="At least one file is required"
#     return 1;
#   fi
#
#   path=$tmp_path
# }
#
# compute_all_checksum() {
#
#   combined_sha=""
#   counter=0
#   error_counter=0
#
#   for i in $path; do
#
#     file_sha=`update_sha $i`
#     ret=$?
#     # echo $i is $file_sha with return $ret
#
#     if [ $ret -eq 0 ]; then
#       combined_sha="${combined_sha}${file_sha}"
#     else
#       ((error_counter=error_counter + 1))
#     fi
#     ((counter=counter + 1))
#   done;
#
#   echo $combined_sha
# }
#
# check_files
# check_error
#
# files_sha=`compute_all_checksum`
# previous_sha=$files_sha
# execute_command() {
#
#   if [ $verbose -eq 1 ]; then
#     echo "Executing command: ${cmd}..."
#   fi
#   /bin/bash -c "$cmd"
# }
# compare() {
#   files_sha=`compute_all_checksum`
#   if [[ $files_sha != $previous_sha ]] ; then
#
#     if [ $quiet -eq 0 ]; then
#       echo -e "\nFile(s) changed"
#     fi
#
#     execute_command
#     previous_sha=$files_sha
#   else
#     if [ $quiet -lt 2 ]; then
#       echo -n '#'
#     fi
#   fi
# }
#
# trap exit SIGQUIT
# trap exit SIGINT
#
# if [ $quiet -eq 0 ]; then
#   echo -e "## Watching files: ${path}"
# fi
#
# while true; do
#   compare
#   sleep $interval
# done

#!/bin/bash

SCRIPTNAME=`basename "$0"`

print_help() {
	cat << EOF
Usage: $SCRIPTNAME filename
Uses 'inotifywait' to sleep until 'filename' has been modified.

Inspired by http://superuser.com/questions/181517/how-to-execute-a-command-whenever-a-file-changes/181543#181543

TODO: rewrite this as a simple Python script, using pyinotify
EOF
}

# check dependencies
if ! type inotifywait &>/dev/null ; then
	echo "You are missing the inotifywait dependency. Install the package inotify-tools (apt-get install inotify-tools)"
	exit 1
fi

# parse_parameters:
while [[ "$1" == -* ]] ; do
	case "$1" in
		-h|-help|--help)
			print_help
			exit
			;;
		--)
			#echo "-- found"
			shift
			break
			;;
		*)
			echo "Invalid parameter: '$1'"
			exit 1
			;;
	esac
done

if [ "$#" != 1 ] ; then
	echo "Incorrect parameters. Use --help for usage instructions."
	exit 1
fi

FULLNAME="$1"
BASENAME=`basename "$FULLNAME"`
DIRNAME=`dirname "$FULLNAME"`

coproc INOTIFY {
	inotifywait -q -m -e close_write,moved_to,create ${DIRNAME} &
	trap "kill $!" 1 2 3 6 15
	wait
}

trap "kill $INOTIFY_PID" 0 1 2 3 6 15

# BUG! Não vai funcionar com arquivos contendo caracteres estranhos
sed --regexp-extended -n "/ (CLOSE_WRITE|MOVED_TO|CREATE)(,CLOSE)? ${BASENAME}\$/q" 0<&${INOTIFY[0]}
